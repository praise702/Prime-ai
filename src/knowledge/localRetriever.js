/* Local RAG foundation: opt-in files in data/documents, no external service. */
const fs = require("fs");
const path = require("path");
const config = require("../config/config");
const DOCUMENT_DIRECTORY = path.join(config.dataDir, "documents");
const MAX_FILE_BYTES = 512 * 1024;
const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 160;
let cachedChunks = null;

function terms(value) {
    const ignored = new Set(["what", "who", "where", "when", "why", "how", "the", "and", "are", "is", "about", "tell", "more", "this", "that"]);
    return String(value || "").toLowerCase().match(/[a-z0-9]{3,}/g)?.filter(word => !ignored.has(word)) || [];
}
function readDocument(file) {
    const stat = fs.statSync(file);
    if (!stat.isFile() || stat.size > MAX_FILE_BYTES || ![".txt", ".md", ".json"].includes(path.extname(file).toLowerCase())) return "";
    const raw = fs.readFileSync(file, "utf8");
    try { return path.extname(file).toLowerCase() === ".json" ? JSON.stringify(JSON.parse(raw)) : raw; } catch { return raw; }
}
function chunkDocument(text, title) {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    const chunks = [];
    for (let start = 0; start < clean.length; start += CHUNK_SIZE - CHUNK_OVERLAP) {
        const value = clean.slice(start, start + CHUNK_SIZE).trim();
        if (value.length >= 40) chunks.push({ title, text: value });
        if (start + CHUNK_SIZE >= clean.length) break;
    }
    return chunks;
}
function loadChunks() {
    if (cachedChunks) return cachedChunks;
    if (!fs.existsSync(DOCUMENT_DIRECTORY)) return [];
    const chunks = [];
    for (const entry of fs.readdirSync(DOCUMENT_DIRECTORY, { withFileTypes: true })) {
        if (entry.isFile()) chunks.push(...chunkDocument(readDocument(path.join(DOCUMENT_DIRECTORY, entry.name)), path.basename(entry.name, path.extname(entry.name))));
    }
    cachedChunks = chunks;
    return chunks;
}
function retrieve(query, limit = 4) {
    const queryTerms = terms(query);
    if (!queryTerms.length) return [];
    return loadChunks().map(chunk => {
        const matches = queryTerms.filter(term => `${chunk.title} ${chunk.text}`.toLowerCase().includes(term)).length;
        return { ...chunk, relevance: matches / queryTerms.length };
    }).filter(chunk => chunk.relevance >= 0.35).sort((a, b) => b.relevance - a.relevance)
        .slice(0, Math.max(1, Math.min(limit, 10)))
        .map(chunk => ({ ...chunk, source: "Local document", type: "rag", retrievedAt: new Date().toISOString() }));
}
function clearCache() { cachedChunks = null; }
module.exports = { retrieve, loadChunks, clearCache, DOCUMENT_DIRECTORY };
