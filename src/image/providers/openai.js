const axios = require("axios");
const { savePng } = require("./_localStorage");

function isAvailable() { return Boolean(process.env.OPENAI_API_KEY); }

async function generate(prompt, context = {}) {
    if (!isAvailable()) return { success: false, provider: "OpenAI Images", status: "unavailable", error: "Provider is not configured" };
    try {
        const response = await axios.post("https://api.openai.com/v1/images/generations", {
            model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1", prompt, size: "1024x1024"
        }, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, timeout: 120000 });
        const image = response.data?.data?.[0];
        let bytes = null;
        if (typeof image?.b64_json === "string") bytes = Buffer.from(image.b64_json, "base64");
        else if (typeof image?.url === "string") bytes = Buffer.from((await axios.get(image.url, { responseType: "arraybuffer", timeout: 60000 })).data);
        if (!bytes) throw new Error("Image provider returned no transferable image data");
        const saved = savePng(bytes, context.requestId);
        return { success: true, provider: "OpenAI Images", status: "completed", filePath: saved.filePath, imageUrl: saved.imageUrl };
    } catch (error) {
        return { success: false, provider: "OpenAI Images", status: "error", error: error.response?.data?.error?.message || error.message || "Image generation failed" };
    }
}

module.exports = { name: "OpenAI Images", isAvailable, generate };
