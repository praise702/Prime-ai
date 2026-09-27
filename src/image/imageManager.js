const imageConfig = require("./imageConfig");
const imageJobs = require("./imageJobs");
const { createGenerationPlan } = require("./imagePlanner");
const { validateProviderResult } = require("./imageQuality");
const local = require("./providers/local");
const stability = require("./providers/stability");
const openai = require("./providers/openai");
const replicate = require("./providers/replicate");

const providersById = { local, stability, openai, replicate };
const defaultProviders = imageConfig.providerOrder.map(id => providersById[id]).filter(Boolean);
const cancelledRequests = new Set();
let activeJobs = 0;
const queuedJobs = [];

function log(requestId, stage, data = {}) {
    console.log(JSON.stringify({ scope: "IMAGE", requestId, stage, timestamp: new Date().toISOString(), ...data }));
}

function enqueue(task) {
    return new Promise((resolve, reject) => {
        queuedJobs.push({ task, resolve, reject });
        drainQueue();
    });
}

function drainQueue() {
    while (activeJobs < imageConfig.maxConcurrentJobs && queuedJobs.length) {
        const next = queuedJobs.shift();
        activeJobs += 1;
        Promise.resolve(next.task())
            .then(next.resolve, next.reject)
            .finally(() => {
                activeJobs -= 1;
                drainQueue();
            });
    }
}

function providerList(options) {
    if (Array.isArray(options.providers)) return options.providers;
    return defaultProviders;
}

function isRetryable(error) {
    return /timeout|timed out|network|connect|rate limit|\b5\d\d\b/i.test(String(error || ""));
}

async function runGeneration(prompt, options) {
    const requestId = options.requestId;
    const plan = options.plan;
    const failures = [];
    const providers = providerList(options);

    imageJobs.updateJob(requestId, { status: "running", stage: "planning" });
    log(requestId, "planning", { width: plan.width, height: plan.height });

    for (const provider of providers) {
        const providerName = provider.name || "Image provider";

        if (cancelledRequests.has(requestId)) {
            imageJobs.updateJob(requestId, { status: "cancelled", stage: "cancelled" });
            return { success: false, type: "image", requestId, imageUrl: null, status: "cancelled", error: "Image generation was cancelled", failures };
        }

        const available = await provider.isAvailable();
        if (!available) {
            const failure = { provider: providerName, status: "unavailable", error: "Provider is not configured or unavailable" };
            failures.push(failure);
            imageJobs.appendAttempt(requestId, failure);
            log(requestId, "provider-unavailable", { provider: providerName });
            continue;
        }

        for (let retry = 0; retry <= imageConfig.maxRetries; retry += 1) {
            imageJobs.updateJob(requestId, { stage: "generating", provider: providerName });
            log(requestId, "generating", { provider: providerName, retry });
            const started = Date.now();
            const result = await provider.generate(plan.positivePrompt || prompt, { requestId, plan });
            const durationMs = Date.now() - started;

            if (result?.success) {
                imageJobs.updateJob(requestId, { stage: "evaluating" });
                log(requestId, "evaluating", { provider: providerName, durationMs });
                const quality = validateProviderResult(result);

                if (quality.valid) {
                    const duplicate = quality.sha256 ? imageJobs.findByHash(quality.sha256) : null;
                    const completed = {
                        status: "completed",
                        stage: "completed",
                        provider: providerName,
                        model: result.model || providerName,
                        seed: result.seed ?? plan.seed ?? null,
                        imageUrl: result.imageUrl,
                        outputPath: result.filePath || null,
                        quality,
                        duplicateOf: duplicate?.requestId || null
                    };
                    imageJobs.updateJob(requestId, completed);
                    log(requestId, "completed", { provider: providerName, durationMs, duplicateOf: completed.duplicateOf });
                    return { success: true, type: "image", requestId, imageUrl: result.imageUrl, model: completed.model, provider: providerName, seed: completed.seed, status: "completed", quality, generationPlan: plan };
                }

                result.success = false;
                result.error = quality.error || "Generated image failed validation";
            }

            const failure = { provider: providerName, status: result?.status || "error", error: result?.error || "Provider returned no image", retry, durationMs };
            failures.push(failure);
            imageJobs.appendAttempt(requestId, failure);
            log(requestId, "provider-failed", { provider: providerName, retry, durationMs, error: failure.error });

            if (!isRetryable(failure.error) || retry === imageConfig.maxRetries) break;
        }
    }

    imageJobs.updateJob(requestId, { status: "failed", stage: "failed", failures });
    log(requestId, "failed", { failures: failures.length });
    return { success: false, type: "image", requestId, imageUrl: null, status: "failed", error: "All image providers failed", failures: failures.map(({ provider, status, error, retry, durationMs }) => ({ provider, status, error, retry, durationMs })), generationPlan: plan };
}

async function createImage(prompt, optionsOrProviders = {}) {
    const options = Array.isArray(optionsOrProviders) ? { providers: optionsOrProviders } : optionsOrProviders;
    const plan = options.plan || createGenerationPlan({ originalPrompt: options.originalPrompt || prompt, correctedPrompt: prompt, settings: options.settings });
    const job = imageJobs.createJob({
        requestId: options.requestId,
        userId: options.userId,
        originalPrompt: options.originalPrompt || prompt,
        enhancedPrompt: options.enhancedPrompt || prompt,
        correctedPrompt: prompt,
        plan
    });

    return enqueue(() => runGeneration(prompt, { ...options, requestId: job.requestId, plan }));
}

async function cancelImage(requestId) {
    const job = imageJobs.getJob(requestId);
    if (!job || ["completed", "failed", "cancelled"].includes(job.status)) return { cancelled: false, job };
    cancelledRequests.add(requestId);
    if (job.provider === local.name) await local.cancel(requestId);
    imageJobs.updateJob(requestId, { status: "cancelled", stage: "cancelled" });
    log(requestId, "cancelled");
    return { cancelled: true, job: imageJobs.getJob(requestId) };
}

function getImageStatus(requestId) {
    return imageJobs.getJob(requestId);
}

module.exports = { cancelImage, createImage, defaultProviders, getImageStatus };
