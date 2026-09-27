const crypto = require("crypto");
const config = require("../config/config");
const db = require("../storage/database");
const userModel = require("../auth/userModel");

function hashToken(token) { return crypto.createHash("sha256").update(token).digest("hex"); }

function parseCookies(header) {
    const out = {};
    for (const part of String(header || "").split(";")) {
        const index = part.indexOf("=");
        if (index <= 0) continue;
        const key = part.slice(0, index).trim();
        const value = part.slice(index + 1).trim();
        try { out[key] = decodeURIComponent(value); } catch { /* ignore malformed cookie */ }
    }
    return out;
}

function cleanupExpiredSessions(data, now = Date.now()) {
    for (const [tokenHash, session] of Object.entries(data)) {
        if (!session || session.expiresAt <= now) delete data[tokenHash];
    }
}

function createSession(userId) {
    const raw = crypto.randomBytes(32).toString("base64url");
    const data = db.sessions();
    cleanupExpiredSessions(data);
    data[hashToken(raw)] = { userId, createdAt: Date.now(), expiresAt: Date.now() + config.sessionTtlMs };
    db.saveSessions(data);
    return raw;
}

function destroySession(raw) {
    if (!raw) return;
    const data = db.sessions();
    delete data[hashToken(raw)];
    db.saveSessions(data);
}

function userFromToken(raw) {
    if (!raw || raw.length < 20 || raw.length > 200) return null;
    const data = db.sessions();
    const tokenHash = hashToken(raw);
    const session = data[tokenHash];
    if (!session) return null;
    if (session.expiresAt <= Date.now()) {
        delete data[tokenHash];
        db.saveSessions(data);
        return null;
    }
    const user = userModel.findById(session.userId);
    return userModel.sanitize(user);
}

function extractToken(req) {
    const authorization = String(req.headers.authorization || "");
    const bearer = authorization.match(/^Bearer ([A-Za-z0-9._~-]{20,200})$/i);
    if (bearer?.[1]) return bearer[1];
    const cookies = parseCookies(req.headers.cookie);
    const cookie = cookies.prime_session;
    return typeof cookie === "string" && cookie.length >= 20 && cookie.length <= 200 ? cookie : null;
}

function auth(req, res, next) {
    const token = extractToken(req);
    const user = userFromToken(token);
    if (!user) return res.status(401).json({ success: false, error: "Authentication is required." });
    req.user = user;
    req.authToken = token;
    next();
}

function optionalAuth(req, res, next) {
    const token = extractToken(req);
    const user = userFromToken(token);
    if (user) {
        req.user = user;
        req.authToken = token;
    }
    next();
}

function setSessionCookie(res, token) {
    const secure = config.secureCookies ? "; Secure" : "";
    res.setHeader(
        "Set-Cookie",
        `prime_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(config.sessionTtlMs / 1000)}${secure}`
    );
}

function clearSessionCookie(res) {
    const secure = config.secureCookies ? "; Secure" : "";
    res.setHeader("Set-Cookie", `prime_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`);
}

module.exports = auth;
module.exports.auth = auth;
module.exports.optionalAuth = optionalAuth;
module.exports.createSession = createSession;
module.exports.destroySession = destroySession;
module.exports.userFromToken = userFromToken;
module.exports.extractToken = extractToken;
module.exports.setSessionCookie = setSessionCookie;
module.exports.clearSessionCookie = clearSessionCookie;
