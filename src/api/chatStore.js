const db = require("../storage/database");
function safeId(id) { return /^[A-Za-z0-9_-]{1,128}$/.test(String(id || "")); }
function list(userId) { const data = db.chats(); return Object.values(data[userId] || {}).sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt))); }
function get(userId, chatId) { if (!safeId(chatId)) return null; return db.chats()[userId]?.[chatId] || null; }
function sanitizeAttachment(attachment) {
    if (!attachment || typeof attachment !== "object") return null;
    if (!/^[A-Za-z0-9_-]{16,128}$/.test(String(attachment.id || ""))) return null;
    if (typeof attachment.name !== "string" || attachment.name.length > 255) return null;
    if (typeof attachment.type !== "string" || attachment.type.length > 150) return null;
    if (!Number.isInteger(attachment.size) || attachment.size < 0 || attachment.size > 20 * 1024 * 1024) return null;
    return {
        id: attachment.id,
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        url: `/api/uploads/${attachment.id}`
    };
}


function sanitizeSource(source) {
    if (!source || typeof source !== "object") return null;
    const title = String(source.title || "").trim();
    const provider = String(source.source || source.provider || "Web").trim();
    if (!title || title.length > 240 || !provider || provider.length > 160) return null;
    const url = typeof source.url === "string" && /^https?:\/\//i.test(source.url)
        ? source.url.slice(0, 2048)
        : null;
    const publishedAt = source.publishedAt && !Number.isNaN(Date.parse(source.publishedAt))
        ? new Date(source.publishedAt).toISOString()
        : null;
    return { title, source: provider, url, publishedAt };
}
function sanitizeCorrection(correction) {
    if (!correction || typeof correction !== "object") return null;
    const original = String(correction.original || "").trim();
    const corrected = String(correction.corrected || "").trim();
    if (!original || !corrected || original.length > 500 || corrected.length > 500) return null;
    return { changed: original !== corrected, original, corrected };
}

function save(userId, chat) { if (!safeId(chat.id)) throw new Error("Invalid chat ID."); const data = db.chats(); if (!data[userId]) data[userId] = {}; const now = new Date().toISOString(); data[userId][chat.id] = { id: chat.id, title: String(chat.title || "New chat").slice(0, 120), messages: Array.isArray(chat.messages) ? chat.messages.slice(-200).map(m => ({
            sender: m.sender === "user" ? "user" : "ai",
            text: String(m.text || "").slice(0, 12000),
            attachments: Array.isArray(m.attachments)
                ? m.attachments.slice(0, 5).map(sanitizeAttachment).filter(Boolean)
                : [],
            sources: Array.isArray(m.sources)
                ? m.sources.slice(0, 8).map(sanitizeSource).filter(Boolean)
                : [],
            correction: sanitizeCorrection(m.correction),
            time: Number(m.time) || Date.now()
        })) : [], createdAt: data[userId][chat.id]?.createdAt || now, updatedAt: now }; db.saveChats(data); return data[userId][chat.id]; }
function remove(userId, chatId) { const data = db.chats(); if (!data[userId]?.[chatId]) return false; delete data[userId][chatId]; db.saveChats(data); return true; }
module.exports = { list, get, save, remove, safeId };
