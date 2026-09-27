const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const imageConfig = require("./imageConfig");
const { ensureDirectories } = require("./imageLifecycle");

// Tests and isolated deployments can opt out of mutating the repository-backed
// development job store. The production default remains the configured output.
const storagePath = process.env.PRIME_IMAGE_JOBS_PATH || path.join(imageConfig.outputDirectories.root, "jobs.json");

function readStore() {
    ensureDirectories();
    try {
        const parsed = JSON.parse(fs.readFileSync(storagePath, "utf8"));
        return Array.isArray(parsed.jobs) ? parsed : { jobs: [] };
    } catch {
        return { jobs: [] };
    }
}

function writeStore(store) {
    fs.mkdirSync(path.dirname(storagePath), { recursive: true, mode: 0o700 });
    try { fs.chmodSync(path.dirname(storagePath), 0o700); } catch {}
    const temporaryPath = `${storagePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(temporaryPath, JSON.stringify(store, null, 2), { mode: 0o600, flag: "wx" });
    try { fs.chmodSync(temporaryPath, 0o600); } catch {}
    if (process.platform === "win32" && fs.existsSync(storagePath)) fs.rmSync(storagePath, { force: true });
    fs.renameSync(temporaryPath, storagePath);
    try { fs.chmodSync(storagePath, 0o600); } catch {}
}

function createJob({ requestId = crypto.randomUUID(), userId = "default", originalPrompt, enhancedPrompt, correctedPrompt, plan }) {
    const store = readStore();
    const job = {
        requestId,
        userId,
        originalPrompt,
        enhancedPrompt,
        correctedPrompt,
        generationPlan: plan,
        status: "queued",
        stage: "queued",
        attempts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    store.jobs.push(job);
    writeStore(store);
    return job;
}

function updateJob(requestId, patch) {
    const store = readStore();
    const index = store.jobs.findIndex(job => job.requestId === requestId);
    if (index < 0) return null;
    store.jobs[index] = { ...store.jobs[index], ...patch, updatedAt: new Date().toISOString() };
    writeStore(store);
    return store.jobs[index];
}

function appendAttempt(requestId, attempt) {
    const job = getJob(requestId);
    if (!job) return null;
    return updateJob(requestId, { attempts: [...job.attempts, { ...attempt, timestamp: new Date().toISOString() }] });
}

function getJob(requestId) {
    return readStore().jobs.find(job => job.requestId === requestId) || null;
}

function findByHash(sha256) {
    return readStore().jobs.find(job => job.quality?.sha256 === sha256 && job.status === "completed") || null;
}

module.exports = { appendAttempt, createJob, findByHash, getJob, updateJob };
