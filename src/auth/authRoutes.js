const express = require("express");
const controller = require("./authController");
const { auth } = require("../middleware/auth");

function validateAuthBody(req, res, next) {
    if (!req.is("application/json") || !req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: "Invalid authentication request." });
    }
    const allowed = new Set(["name", "email", "password", "confirmPassword"]);
    if (Object.keys(req.body).some(key => !allowed.has(key))) {
        return res.status(400).json({ success: false, error: "Invalid authentication request." });
    }
    for (const key of ["name", "email", "password", "confirmPassword"]) {
        if (req.body[key] !== undefined && (typeof req.body[key] !== "string" || req.body[key].length > 1024)) {
            return res.status(400).json({ success: false, error: "Invalid authentication request." });
        }
    }
    next();
}

function createRouter(rateLimiters = {}) {
    const router = express.Router();
    const authLimiter = rateLimiters.auth;
    const signupLimiter = rateLimiters.signup || authLimiter;

    router.post("/signup", ...(signupLimiter ? [signupLimiter] : []), validateAuthBody, controller.signup);
    router.post("/login", ...(authLimiter ? [authLimiter] : []), validateAuthBody, controller.login);
    router.get("/me", auth, controller.me);
    router.post("/logout", auth, controller.logout);
    return router;
}

module.exports = createRouter;
