const axios = require("axios");
const FormData = require("form-data");
const { savePng } = require("./_localStorage");

function isAvailable() { return Boolean(process.env.STABILITY_API_KEY); }

function readableError(error) {
    const data = error.response?.data;
    if (Buffer.isBuffer(data)) return data.toString("utf8");
    return data?.message || data?.error || error.message || "Unknown image provider error";
}

async function generate(prompt, context = {}) {
    if (!isAvailable()) return { success: false, provider: "Stability AI", status: "unavailable", error: "Provider is not configured" };
    try {
        const form = new FormData();
        form.append("prompt", prompt);
        form.append("output_format", "png");
        const response = await axios.post("https://api.stability.ai/v2beta/stable-image/generate/core", form, {
            headers: { ...form.getHeaders(), Authorization: `Bearer ${process.env.STABILITY_API_KEY}`, Accept: "image/*" },
            responseType: "arraybuffer", timeout: 120000
        });
        const saved = savePng(Buffer.from(response.data), context.requestId);
        return { success: true, provider: "Stability AI", status: "completed", filePath: saved.filePath, imageUrl: saved.imageUrl };
    } catch (error) {
        return { success: false, provider: "Stability AI", status: "error", error: readableError(error) };
    }
}

module.exports = { name: "Stability AI", isAvailable, generate };
