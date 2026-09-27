const express = require("express");
const router = express.Router();
const imageController = require("./imageController");

function validateCreate(req, res, next) {
    if (!req.is("application/json") || !req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: "Invalid image request." });
    }
    if (Object.keys(req.body).some(key => key !== "prompt")) {
        return res.status(400).json({ success: false, error: "Invalid image request." });
    }
    if (typeof req.body.prompt !== "string" || !req.body.prompt.trim() || req.body.prompt.length > 12_000) {
        return res.status(400).json({ success: false, error: "Image prompt must be between 1 and 12,000 characters." });
    }
    req.body.prompt = req.body.prompt.trim();
    next();
}

function validateDelete(req, res, next) {
    if (!req.is("application/json") || !req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: "Invalid image request." });
    }
    if (Object.keys(req.body).some(key => key !== "id")) {
        return res.status(400).json({ success: false, error: "Invalid image request." });
    }
    next();
}

router.post("/create", validateCreate, imageController.createImage);
router.get("/history", imageController.getImageHistory);
router.delete("/delete", validateDelete, imageController.deleteImage);

module.exports = router;
