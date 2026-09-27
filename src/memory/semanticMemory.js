const fs = require("fs");
const path = require("path");
const axios = require("axios");
const qdrant = require("./qdrantStore");
const config = require("../config/config");

const file = path.join(config.dataDir, "semantic-memory.json");
let state = null;

function load() {
  if (state) return state;
  try { state = JSON.parse(fs.readFileSync(file, "utf8")); } catch { state = {}; }
  return state;
}

function save() {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state || {}, null, 2));
}

function words(text) {
  return String(text || "").toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || [];
}

function lexicalSimilarity(a, b) {
  const A = new Set(words(a)), B = new Set(words(b));
  if (!A.size || !B.size) return 0;
  let common = 0; for (const w of A) if (B.has(w)) common++;
  return common / Math.sqrt(A.size * B.size);
}

async function embed(text) {
  const custom = String(process.env.PRIME_EMBEDDING_URL || "").trim();
  if (custom) {
    try {
      const r = await axios.post(custom, { input: String(text || "") }, { timeout: 15000 });
      if (Array.isArray(r.data?.embedding)) return r.data.embedding;
      if (Array.isArray(r.data?.embeddings?.[0])) return r.data.embeddings[0];
    } catch {}
  }
  if (String(process.env.PRIME_ENABLE_OLLAMA_EMBEDDINGS || "false").toLowerCase() !== "true") return null;
  const ollama = String(process.env.PRIME_MODEL_URL || "http://127.0.0.1:11434/api/chat");
  try {
    const base = new URL(ollama); base.pathname = base.pathname.replace(/\/api\/chat\/?$/i, "/api/embed");
    const model = String(process.env.PRIME_EMBEDDING_MODEL || "bge-m3");
    const r = await axios.post(base.toString(), { model, input: String(text || "") }, { timeout: 15000 });
    if (Array.isArray(r.data?.embeddings?.[0])) return r.data.embeddings[0];
    if (Array.isArray(r.data?.embedding)) return r.data.embedding;
  } catch {}
  return null;
}

function cosine(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  let dot = 0, aa = 0, bb = 0; for (let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];}
  return aa && bb ? dot / Math.sqrt(aa*bb) : 0;
}

async function remember(userId, text, metadata = {}) {
  if (!userId || !text) return false;
  const db = load();
  const list = db[userId] || [];
  const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, text: String(text).slice(0, 2000), createdAt: new Date().toISOString(), ...metadata };
  entry.embedding = await embed(entry.text);
  list.push(entry);
  if (entry.embedding) await qdrant.upsert({ id: entry.id, vector: entry.embedding, payload: { userId, text: entry.text, createdAt: entry.createdAt, intent: entry.intent || null } });
  db[userId] = list.slice(-200);
  save();
  return true;
}

async function search(userId, query, limit = 6) {
  const items = load()[userId] || [];
  const embedding = await embed(query);
  const local = items.map(item => ({
    ...item,
    score: (embedding && item.embedding ? cosine(embedding, item.embedding) * 0.8 : 0) + lexicalSimilarity(query, item.text) * 0.2
  }));
  if (embedding && qdrant.enabled()) {
    const remote = await qdrant.search(embedding, limit);
    for (const hit of remote) {
      const payload = hit.payload || {};
      if (payload.userId !== userId) continue;
      const existing = local.find(item => item.id === hit.id);
      if (existing) existing.score = Math.max(existing.score, Number(hit.score) || 0);
      else local.push({ id: String(hit.id), text: String(payload.text || ""), createdAt: payload.createdAt || null, intent: payload.intent || null, score: Number(hit.score) || 0 });
    }
  }
  return local.sort((a,b)=>b.score-a.score).slice(0, limit).filter(item=>item.score >= 0.08);
}

module.exports = { remember, search, embed };
