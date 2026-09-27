const axios = require("axios");
const { savePng } = require("./_localStorage");

function isAvailable() {
    return Boolean(process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_IMAGE_MODEL);
}

function outputUrl(prediction) {
    if (typeof prediction?.output === "string") return prediction.output;
    if (Array.isArray(prediction?.output)) return prediction.output.find(item => typeof item === "string") || null;
    return null;
}

async function waitForPrediction(prediction, headers) {
    let current = prediction;
    for (let attempt = 0; attempt < 18; attempt += 1) {
        if (["succeeded", "failed", "canceled"].includes(current.status)) return current;
        await new Promise(resolve => setTimeout(resolve, 3000));
        if (!current.urls?.get) throw new Error("Replicate did not return a prediction status URL");
        current = (await axios.get(current.urls.get, { headers, timeout: 30000 })).data;
    }
    throw new Error("Replicate image generation timed out");
}

async function generate(prompt, context = {}) {
    if (!isAvailable()) {
        return { success: false, provider: "Replicate", status: "unavailable", error: "REPLICATE_API_TOKEN or REPLICATE_IMAGE_MODEL is not configured" };
    }
    try {
        const [owner, model, ...remainder] = process.env.REPLICATE_IMAGE_MODEL.split("/");
        if (!owner || !model || remainder.length) throw new Error("REPLICATE_IMAGE_MODEL must be in owner/model format");
        const headers = { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`, "Content-Type": "application/json", Prefer: "wait=60" };
        const response = await axios.post(`https://api.replicate.com/v1/models/${owner}/${model}/predictions`, { input: { prompt } }, { headers, timeout: 70000 });
        const prediction = await waitForPrediction(response.data, headers);
        const imageUrl = outputUrl(prediction);
        if (prediction.status !== "succeeded" || !imageUrl) throw new Error(prediction.error || "Image provider returned no image URL");
        const imageBytes = Buffer.from((await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 60000 })).data);
        const saved = savePng(imageBytes, context.requestId);
        return { success: true, provider: "Replicate", status: "completed", filePath: saved.filePath, imageUrl: saved.imageUrl };
    } catch (error) {
        return { success: false, provider: "Replicate", status: "error", error: error.response?.data?.detail || error.response?.data?.title || error.message || "Unknown Replicate image error" };
    }
}

module.exports = { name: "Replicate", isAvailable, generate };
