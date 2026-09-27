const fs = require("fs");
const path = require("path");
const imageConfig = require("../imageConfig");
const { generatedUrl } = require("../imageLifecycle");

function savePng(buffer, requestId = "image") {
    if (!Buffer.isBuffer(buffer) || buffer.length < 16) throw new Error("Invalid image bytes returned by provider");
    const header = buffer.subarray(0, 8).toString("hex");
    if (header !== "89504e470d0a1a0a") throw new Error("Provider did not return a PNG image");
    if (buffer.length > 16 * 1024 * 1024) throw new Error("Generated image is too large");
    const folder = imageConfig.outputDirectories.generated;
    fs.mkdirSync(folder, { recursive: true, mode: 0o700 });
    const safeId = String(requestId).replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 80) || `image_${Date.now()}`;
    const filePath = path.join(folder, `${safeId}.png`);
    fs.writeFileSync(filePath, buffer, { mode: 0o600 });
    return { filePath, imageUrl: generatedUrl(filePath) };
}

module.exports = { savePng };
