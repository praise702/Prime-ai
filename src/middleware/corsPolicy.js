const config = require("../config/config");

function corsPolicy(req, res, next) {
    const origin = req.headers.origin;
    if (!origin) return next();

    let sameOrigin = false;
    try {
        sameOrigin = origin === `${req.protocol}://${req.get("host")}`;
    } catch {}

    if (!sameOrigin && !config.allowedOrigins.includes(origin)) {
        return res.status(403).json({ success: false, error: "Origin is not allowed." });
    }

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "600");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
}

module.exports = corsPolicy;
