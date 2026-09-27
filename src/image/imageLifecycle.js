const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const imageConfig = require("./imageConfig");

function ensureDirectories() {
    Object.values(imageConfig.outputDirectories).forEach(directory => {
        fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
        try { fs.chmodSync(directory, 0o700); } catch {}
    });
}

function isInsideOutputDirectory(filePath) {
    const root = path.resolve(imageConfig.outputDirectories.root);
    const target = path.resolve(filePath);
    return target.startsWith(`${root}${path.sep}`);
}

function generatedUrl(filePath) {
    if (!isInsideOutputDirectory(filePath)) throw new Error("Generated file is outside the approved output directory");
    const relative = path.relative(imageConfig.outputDirectories.generated, filePath).split(path.sep).join("/");
    if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Generated file is not in the generated output directory");
    return `/generated/${relative}`;
}

function readPngDimensions(buffer) {
    if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") return null;
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function validateGeneratedFile(filePath) {
    if (!isInsideOutputDirectory(filePath) || !fs.existsSync(filePath)) return { valid: false, reason: "Generated file is missing or outside the approved directory" };
    const buffer = fs.readFileSync(filePath);
    const dimensions = readPngDimensions(buffer);
    if (!dimensions || !dimensions.width || !dimensions.height) return { valid: false, reason: "Generated file is not a valid PNG" };
    return { valid: true, dimensions, sha256: crypto.createHash("sha256").update(buffer).digest("hex"), bytes: buffer.length };
}

function removeGeneratedTemporary(filePath) {
    const temporaryRoot = path.resolve(imageConfig.outputDirectories.temporary);
    const target = path.resolve(filePath);
    if (!target.startsWith(`${temporaryRoot}${path.sep}`)) throw new Error("Refusing to delete a file outside the temporary output directory");
    if (fs.existsSync(target)) fs.unlinkSync(target);
}

module.exports = { ensureDirectories, generatedUrl, isInsideOutputDirectory, removeGeneratedTemporary, validateGeneratedFile };
