const securityLogger = require("./securityLogger");

function createRateLimiter({ windowMs, max }, keyForRequest) {
    const hits = new Map();
    let lastCleanup = 0;

    return function rateLimit(req, res, next) {
        const key = String(keyForRequest(req) || "unknown");
        const now = Date.now();

        if (now - lastCleanup > Math.max(windowMs, 60_000)) {
            lastCleanup = now;
            for (const [storedKey, timestamps] of hits) {
                const active = timestamps.filter(time => now - time < windowMs);
                if (active.length) hits.set(storedKey, active);
                else hits.delete(storedKey);
            }
        }

        const active = (hits.get(key) || []).filter(time => now - time < windowMs);

        if (active.length >= max) {
            hits.set(key, active);
            const retryAfter = Math.max(1, Math.ceil((windowMs - (now - active[0])) / 1000));
            res.setHeader("Retry-After", String(retryAfter));
            securityLogger.event("rate_limit_exceeded", { scope: keyForRequest.name || "request" });
            return res.status(429).json({ success: false, error: "Too many requests. Please try again later." });
        }

        active.push(now);
        hits.set(key, active);
        return next();
    };
}

function clientKey(req) {
    return req.ip || req.socket?.remoteAddress || "unknown";
}

function createChatRateLimiters(settings) {
    return {
        ip: createRateLimiter(settings.ip, clientKey),
        burst: createRateLimiter(settings.burst, clientKey),
        user: createRateLimiter(settings.user, req => req.user?.id || "unauthenticated"),
        image: createRateLimiter(settings.image || { windowMs: 60_000, max: 3 }, req => req.user?.id || clientKey(req)),
        upload: createRateLimiter(settings.upload || { windowMs: 60_000, max: 10 }, req => req.user?.id || clientKey(req)),
        search: createRateLimiter(settings.search || { windowMs: 60_000, max: 20 }, req => req.user?.id || clientKey(req)),
        auth: createRateLimiter(settings.auth || { windowMs: 15 * 60_000, max: 10 }, clientKey),
        signup: createRateLimiter(settings.signup || { windowMs: 60 * 60_000, max: 5 }, clientKey)
    };
}

module.exports = { createChatRateLimiters };
