const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require("../config/config");
const router = express.Router();

const uploadDir = path.join(config.dataDir, "uploads");

const MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/json",
    "application/pdf",
    "application/xml",
    "text/xml",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
]);

const TEXT_TYPES = new Set([
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/json",
    "application/xml",
    "text/xml"
]);

function safeName(name) {
    return String(name || "file")
        .replace(/[\u0000-\u001f\u007f]/g, "")
        .replace(/[\\/]/g, "_")
        .slice(0, 255) || "file";
}

function idForFile() {
    return crypto.randomBytes(18).toString("base64url");
}

function extensionFor(name) {
    const match = safeName(name).match(/\.([A-Za-z0-9]{1,10})$/);
    return match ? `.${match[1].toLowerCase()}` : "";
}

function filePath(id, name) {
    return path.join(uploadDir, `${id}${extensionFor(name)}`);
}

function assertOwnedFile(userId, id) {
    if (!/^[A-Za-z0-9_-]{16,128}$/.test(String(id || ""))) return null;

    const metadataPath = path.join(uploadDir, `${id}.json`);
    if (!fs.existsSync(metadataPath)) return null;

    try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
        if (metadata.userId !== userId) return null;
        return metadata;
    } catch {
        return null;
    }
}

function readTextSafely(file, maxBytes = 100_000) {
    try {
        return fs.readFileSync(file, {
            encoding: "utf8",
            flag: "r"
        }).slice(0, maxBytes);
    } catch {
        return "";
    }
}

router.post("/", (req, res) => {
    try {
        const { name, type, size, data } = req.body || {};

        if (
            typeof name !== "string" ||
            typeof type !== "string" ||
            !Number.isInteger(size) ||
            typeof data !== "string"
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid upload."
            });
        }

        if (!MIME_TYPES.has(type.toLowerCase())) {
            return res.status(415).json({
                success: false,
                error: "This file type is not supported."
            });
        }

        if (
            size < 1 ||
            size > config.maxUploadBytes
        ) {
            return res.status(413).json({
                success: false,
                error: `Files must be ${Math.floor(config.maxUploadBytes / 1024 / 1024)} MB or smaller.`
            });
        }

        const normalizedData = data.replace(/\s/g, "");

        if (
            normalizedData.length > Math.ceil(config.maxUploadBytes * 4 / 3) + 32 ||
            !/^[A-Za-z0-9+/]*={0,2}$/.test(normalizedData)
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid file data."
            });
        }

        const buffer = Buffer.from(normalizedData, "base64");

        if (
            buffer.length !== size ||
            buffer.length > config.maxUploadBytes
        ) {
            return res.status(400).json({
                success: false,
                error: "File size does not match the upload metadata."
            });
        }

        fs.mkdirSync(uploadDir, { recursive: true });

        const id = idForFile();
        const cleanName = safeName(name);
        const target = filePath(id, cleanName);

        fs.writeFileSync(target, buffer, { flag: "wx", mode: 0o600 });

        const metadata = {
            id,
            userId: req.user.id,
            name: cleanName,
            type,
            size: buffer.length,
            createdAt: new Date().toISOString(),
            path: target
        };

        fs.writeFileSync(
            path.join(uploadDir, `${id}.json`),
            JSON.stringify(metadata, null, 2),
            { flag: "wx", mode: 0o600 }
        );

        return res.status(201).json({
            success: true,
            attachment: {
                id,
                name: cleanName,
                type,
                size: buffer.length,
                url: `/api/uploads/${id}`
            },
            text: TEXT_TYPES.has(type.toLowerCase())
                ? readTextSafely(target)
                : null
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Upload failed."
        });
    }
});

router.get("/:id", (req, res) => {
    const metadata = assertOwnedFile(req.user.id, req.params.id);

    if (!metadata || !fs.existsSync(metadata.path)) {
        return res.status(404).json({
            success: false,
            error: "File not found."
        });
    }

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Type", metadata.type);
    res.setHeader(
        "Content-Disposition",
        metadata.type.startsWith("image/")
            ? `inline; filename="${metadata.name.replace(/["\r\n]/g, "_")}"`
            : `attachment; filename="${metadata.name.replace(/["\r\n]/g, "_")}"`
    );

    return res.sendFile(path.resolve(metadata.path));
});

module.exports = router;
