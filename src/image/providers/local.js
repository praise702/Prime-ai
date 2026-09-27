const axios = require("axios");
const fs = require("fs");
const path = require("path");
const imageConfig = require("../imageConfig");
const { generatedUrl, validateGeneratedFile } = require("../imageLifecycle");

function engineHeaders() {
    const token = String(process.env.PRIME_IMAGE_ENGINE_TOKEN || "").trim();
    return token ? { "X-Prime-Engine-Token": token } : {};
}

async function health() {
    try {
        const response = await axios.get(`${imageConfig.localServiceUrl}/health`, {
            timeout: 3000,
            headers: engineHeaders()
        });
        return response.data;
    } catch (error) {
        return { healthy: false, error: error.message };
    }
}

async function isAvailable() {
    const status = await health();
    return Boolean(status.healthy && status.model?.available);
}

async function generate(prompt, context = {}) {
    try {
        const response = await axios.post(
            `${imageConfig.localServiceUrl}/generate`,
            {
                requestId: context.requestId,
                prompt,
                negativePrompt: context.plan?.negativePrompt,
                seed: context.plan?.seed,
                width: context.plan?.width,
                height: context.plan?.height,
                steps: context.plan?.steps,
                guidance: context.plan?.guidance,
                outputPath: path.join(imageConfig.outputDirectories.generated, `${context.requestId}.png`),
                returnBase64: true
            },
            { timeout: imageConfig.localServiceTimeoutMs, headers: engineHeaders() }
        );
        const result = response.data;
        const filePath = path.join(imageConfig.outputDirectories.generated, `${context.requestId}.png`);

        if (typeof result.imageBase64 === "string") {
            const compact = result.imageBase64.replace(/\s+/g, "");
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(compact) || compact.length > 14_000_000) {
                return { success: false, provider: "PRIME Local Model", status: "error", error: "Local image service returned invalid image data" };
            }
            const bytes = Buffer.from(compact, "base64");
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, bytes, { mode: 0o600 });
        } else if (typeof result.imagePath === "string") {
            // Same-host mode: the Python engine may already have written the file.
            // Remote mode must return imageBase64 so this process can persist it locally.
            if (path.resolve(result.imagePath) !== path.resolve(filePath)) {
                return { success: false, provider: "PRIME Local Model", status: "error", error: "Image service did not return transferable image data" };
            }
        }

        const validation = validateGeneratedFile(filePath);

        if (!result.success || !validation.valid) {
            return { success: false, provider: "PRIME Local Model", status: "error", error: result.error || validation.reason || "Local service returned an invalid image" };
        }

        return {
            success: true,
            provider: "PRIME Local Model",
            model: result.model,
            status: "completed",
            filePath,
            imageUrl: generatedUrl(filePath),
            seed: result.seed
        };
    } catch (error) {
        const detail = error.response?.data?.error || error.message || "Local image service failed";
        console.error(`[IMAGE] Local generation failed: ${detail}`);
        return { success: false, provider: "PRIME Local Model", status: "error", error: detail };
    }
}

async function cancel(requestId) {
    try {
        const response = await axios.post(
            `${imageConfig.localServiceUrl}/cancel`,
            { requestId },
            { timeout: 5000, headers: engineHeaders() }
        );
        return Boolean(response.data?.cancelled);
    } catch {
        return false;
    }
}

module.exports = { name: "PRIME Local Model", isAvailable, generate, health, cancel };
