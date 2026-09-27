const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require("../config/config");

const dataDir = config.dataDir;
const files = {
    users: path.join(dataDir, "users.json"),
    sessions: path.join(dataDir, "sessions.json"),
    chats: path.join(dataDir, "chats.json")
};

function ensureFile(file, initialValue) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify(initialValue, null, 2), { mode: 0o600, flag: "wx" });
    }
    try { fs.chmodSync(file, 0o600); } catch {}
}

function ensure() {
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
    try { fs.chmodSync(dataDir, 0o700); } catch {}
    ensureFile(files.users, { users: {} });
    ensureFile(files.sessions, {});
    ensureFile(files.chats, {});
}

function read(file, fallback = {}) {
    ensure();
    try {
        const value = JSON.parse(fs.readFileSync(file, "utf8"));
        return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
    } catch {
        return fallback;
    }
}

function atomicWrite(file, data) {
    ensure();
    const temp = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(data, null, 2), { mode: 0o600, flag: "wx" });
    try { fs.chmodSync(temp, 0o600); } catch {}
    if (process.platform === "win32" && fs.existsSync(file)) fs.rmSync(file, { force: true });
    fs.renameSync(temp, file);
}

function users() { return read(files.users, { users: {} }); }
function saveUsers(data) { atomicWrite(files.users, data); }
function sessions() { return read(files.sessions, {}); }
function saveSessions(data) { atomicWrite(files.sessions, data); }
function chats() { return read(files.chats, {}); }
function saveChats(data) { atomicWrite(files.chats, data); }
function createId(prefix) { return `${prefix}_${crypto.randomBytes(18).toString("hex")}`; }
module.exports = { files, dataDir, ensure, users, saveUsers, sessions, saveSessions, chats, saveChats, createId };
