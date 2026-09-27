const express = require("express");
const router = express.Router();
const controller = require("./controller");
const { optionalAuth } = require("../middleware/auth");

router.post("/chat", controller.chat);

router.get("/health", (req, res) => {
    res.json({
        success: true,
        service: "Prime",
        status: "ok",
        model: process.env.PRIME_MODEL_NAME || "local-model"
    });
});

// The landing page is intentionally removed. The root goes straight to the
// authenticated chat when a valid session exists, otherwise to sign-in.
router.get("/", optionalAuth, (req, res) => {
    res.redirect(req.user ? "/chat.html" : "/login.html");
});

module.exports = router;
