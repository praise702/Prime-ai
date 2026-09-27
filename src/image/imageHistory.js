const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require("../config/config");

const storagePath = path.join(config.dataDir, "images", "image-history.json");

function ensureStorage() {
    fs.mkdirSync(path.dirname(storagePath), { recursive: true, mode: 0o700 });
    if (!fs.existsSync(storagePath)) {
        fs.writeFileSync(storagePath, JSON.stringify({ images: [] }, null, 2), { mode: 0o600, flag: "wx" });
    }
}

function loadImages() {
    ensureStorage();
    try {
        const data = JSON.parse(fs.readFileSync(storagePath, "utf8"));
        return Array.isArray(data.images) ? data : { images: [] };
    } catch {
        return { images: [] };
    }
}

function saveImages(data) {
    ensureStorage();
    const temporary = `${storagePath}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(data, null, 2), { mode: 0o600, flag: "wx" });
    if (process.platform === "win32" && fs.existsSync(storagePath)) fs.rmSync(storagePath, { force: true });
    fs.renameSync(temporary, storagePath);
    try { fs.chmodSync(storagePath, 0o600); } catch {}
}

function saveImage(userId, prompt, enhancedPrompt, image = {}) {
    if (!userId) return false;
    const database = loadImages();
    database.images.push({
        id: `img_${crypto.randomBytes(18).toString("hex")}`,
        user: String(userId),
        prompt: String(prompt || "").slice(0, 4_000),
        enhancedPrompt: String(enhancedPrompt || "").slice(0, 8_000),
        imageUrl: typeof image.imageUrl === "string" ? image.imageUrl.slice(0, 2_048) : null,
        requestId: typeof image.requestId === "string" ? image.requestId.slice(0, 128) : null,
        created: new Date().toISOString()
    });
    saveImages(database);
    return true;
}

function getImages(userId = "") {
    return loadImages().images.filter(image => image.user === String(userId));
}

function deleteImage(userId, id) {
    const database = loadImages();
    const before = database.images.length;
    database.images = database.images.filter(image => !(image.user === String(userId) && image.id === String(id)));
    if (database.images.length === before) return false;
    saveImages(database);
    return true;
}

module.exports = { saveImage, getImages, deleteImage };
