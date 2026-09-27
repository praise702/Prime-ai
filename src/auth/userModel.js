const crypto = require("crypto");
const db = require("../storage/database");

function normalizeEmail(email) { return String(email || "").trim().toLowerCase(); }
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return { salt, hash };
}
function verifyPassword(password, record) {
    if (!record?.salt || !record?.passwordHash) return false;
    const actual = crypto.scryptSync(password, record.salt, 64);
    const expected = Buffer.from(record.passwordHash, "hex");
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
function sanitize(user) { return user ? { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt } : null; }
function createUser({ name, email, password }) {
    const normalized = normalizeEmail(email);
    const displayName = typeof name === "string" ? name.trim() : "";
    const displayNameLength = Array.from(displayName).length;
    const containsControlCharacter = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(displayName);
    if (!displayName || displayNameLength > 255 || containsControlCharacter) {
        throw Object.assign(new Error("Please enter a name between 1 and 255 characters."), { code: "INVALID_NAME" });
    }
    if (!validateEmail(normalized)) throw Object.assign(new Error("Enter a valid email address."), { code: "INVALID_EMAIL" });
    if (typeof password !== "string" || password.length < 8 || password.length > 128) throw Object.assign(new Error("Password must be 8 to 128 characters."), { code: "INVALID_PASSWORD" });
    const data = db.users();
    const existing = Object.values(data.users).find(user => user.email === normalized);
    if (existing) throw Object.assign(new Error("An account with that email already exists."), { code: "EMAIL_EXISTS" });
    const id = db.createId("usr");
    const { salt, hash } = hashPassword(password);
    const user = { id, email: normalized, name: displayName, salt, passwordHash: hash, createdAt: new Date().toISOString() };
    data.users[id] = user;
    db.saveUsers(data);
    return sanitize(user);
}
function findByEmail(email) { const normalized = normalizeEmail(email); const data = db.users(); return Object.values(data.users).find(user => user.email === normalized) || null; }
function findById(id) { const data = db.users(); return data.users[id] || null; }
module.exports = { normalizeEmail, validateEmail, createUser, findByEmail, findById, verifyPassword, sanitize };
