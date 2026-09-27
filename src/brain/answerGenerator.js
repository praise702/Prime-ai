const logger = require("../utils/logger");
const { classify } = require("../intelligence/queryUnderstanding");

function cleanText(value) {
    return String(value || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/\[[^\]]*\]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function splitSentences(text) {
    return cleanText(text)
        .split(/(?<=[.!?])\s+/)
        .map(item => item.trim())
        .filter(item => item.length >= 25 && item.length <= 600);
}

function queryTerms(query) {
    const stop = new Set(["what", "who", "where", "when", "why", "how", "is", "are", "the", "a", "an", "of", "to", "me", "tell", "about", "latest", "current", "news", "do", "does", "did", "you", "your", "know", "can", "could", "would", "please", "want", "need", "much", "more", "newest", "recent", "today", "now", "top", "five", "ten"]);
    return cleanText(query)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter(word => word.length > 2 && !stop.has(word));
}

function isNewsQuery(query) {
    try { return classify(query) === "NEWS"; } catch { return /\b(latest|today|recent|breaking|news)\b/i.test(query); }
}

function isLatestGpuQuery(query) {
    try { return classify(query) === "LATEST_GPU"; } catch { return /\b(?:latest|newest|current)\b.*\b(?:gpu|gpus|graphics cards?)\b/i.test(query); }
}

function isListQuery(query) {
    return /\b(?:latest|newest|current|recent|top)\b/i.test(String(query || "")) && /\b(?:5|five|10|ten|top)\b/i.test(String(query || ""));
}

function createGenericListAnswer(items) {
    const rows = [];
    const seen = new Set();
    for (const item of items || []) {
        const title = cleanText(item.title || "");
        if (!title) continue;
        const cleaned = title.replace(/\s+[-|]\s+(?:[A-Z][^-|]+)$/g, "").trim();
        if (!cleaned || cleaned.length < 3) continue;
        const key = cleaned.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push(cleaned);
        if (rows.length >= 5) break;
    }
    if (!rows.length) return null;
    return `Here are the most relevant current results I found:\n\n${rows.map((title, index) => `${index + 1}. ${title}`).join("\n")}`;
}

function isCurrentGpuModel(model) {
    const value = String(model || "").replace(/\s+/g, " ").trim();

    // Current consumer desktop GPU families:
    // NVIDIA GeForce RTX 50 series
    // AMD Radeon RX 9000 series
    // Intel Arc B-series
    return (
        /\bRTX\s+50\d{2}\b/i.test(value) ||
        /\b(?:Radeon\s+)?RX\s+9\d{3}\b/i.test(value) ||
        /\bArc\s+B\d{3}\b/i.test(value)
    );
}

function extractGpuModels(items) {
    const models = [];
    const seen = new Set();

    const pattern = /(?:\b(?:NVIDIA\s+)?(?:GeForce\s+)?RTX\s+50\d{2}(?:\s+(?:Ti|SUPER|Super))?(?:\s+(?:Laptop|Mobile))?|\b(?:AMD\s+)?(?:Radeon\s+)?RX\s+9\d{3}(?:\s+(?:XT|GRE|XTX|PRO))?|\b(?:Intel\s+)?Arc\s+B\d{3,4})/gi;

    for (const item of items || []) {
        const text = `${item.title || ""}. ${item.text || item.answer || ""}`;

        for (const match of text.matchAll(pattern)) {
            const model = match[0].replace(/\s+/g, " ").trim();

            if (!isCurrentGpuModel(model)) continue;

            const key = model
                .toLowerCase()
                .replace(/\b(?:nvidia|amd|intel|geforce|radeon)\b/g, "")
                .replace(/\s+/g, " ")
                .trim();

            if (!seen.has(key)) {
                seen.add(key);
                models.push({ model, item });
            }

            if (models.length >= 5) return models;
        }
    }

    return models;
}

function createGpuAnswer(items) {
    const models = extractGpuModels(items);

    if (!models.length) return null;

    const count = Math.min(models.length, 5);
    const label = count === 5
        ? "Here are five current GPU models I found:"
        : `Here are ${count} current GPU models I found:`;

    const lines = models
        .slice(0, 5)
        .map((entry, index) => `${index + 1}. ${entry.model}`);

    return `${label}\n\n${lines.join("\n")}`;
}

function isCurrentOfficeQuery(query) {
    return /\b(current|present|now|today)\b/i.test(query) && /\b(chief minister|minister|president|prime minister|governor|mayor|cm)\b/i.test(query);
}

function cleanHeadline(title) {
    return cleanText(title).replace(/\s+[-|]\s+[^-|]+$/, "").replace(/[.!?]+$/, "").trim();
}

function createNewsAnswer(items) {
    const headlines = items
        .filter(item => item.type === "news")
        .slice(0, 5)
        .map(item => cleanHeadline(item.title))
        .filter(Boolean);
    return headlines.length ? `Here are the latest headlines I found:\n\n${headlines.map(headline => `- ${headline}`).join("\n")}` : null;
}

function createGeneralSearchFallback(items, message) {
    const terms = queryTerms(message);
    const ranked = (items || [])
        .filter(Boolean)
        .map(item => ({
            item,
            score: Number(item.relevanceScore) || Number(item.score) || Number(item.searchScore) || 0,
            external: Boolean(item.url || item.provider)
        }))
        .sort((a, b) => b.score - a.score || Number(b.external) - Number(a.external));

    const selected = [];
    const usedSentences = new Set();
    for (const entry of ranked.slice(0, 10)) {
        const item = entry.item;
        const title = cleanText(item.title);
        const body = cleanText(item.answer || item.text || item.content || "");
        const candidates = splitSentences(body);
        const scored = candidates.map(sentence => {
            const lower = sentence.toLowerCase();
            const matched = terms.filter(term => lower.includes(term)).length;
            const titleBoost = terms.filter(term => title.toLowerCase().includes(term)).length;
            return { sentence, score: matched * 3 + titleBoost };
        }).sort((a, b) => b.score - a.score);
        const best = scored.find(entry => entry.score > 0) || scored[0];
        if (!best?.sentence) continue;
        const normalized = best.sentence.toLowerCase().slice(0, 180);
        if (usedSentences.has(normalized)) continue;
        usedSentences.add(normalized);
        selected.push(title && !best.sentence.toLowerCase().startsWith(title.toLowerCase()) ? `${title}: ${best.sentence}` : best.sentence);
        if (selected.length >= (terms.length >= 4 ? 4 : 3)) break;
    }

    if (selected.length) return selected.join(" ");

    for (const entry of ranked.slice(0, 5)) {
        const item = entry.item;
        const title = cleanText(item.title);
        const body = cleanText(item.answer || item.text || item.content || "");
        if (title && body) return `${title}: ${body.slice(0, 600)}`;
    }
    return null;
}

function createCurrentFactAnswer(items, message) {
    const ranked = (items || []).slice().sort((a, b) => (Number(b.score) || Number(b.searchScore) || 0) - (Number(a.score) || Number(a.searchScore) || 0));
    const primary = ranked[0];
    if (!primary) return null;
    const title = cleanText(primary.title || "Current result");
    const body = cleanText(primary.answer || primary.text || primary.content || "");
    if (!title || !body) return null;
    return `${title}: ${splitSentences(body).slice(0, 2).join(" ") || body.slice(0, 700)}`;
}

function createCurrentOfficeAnswer(items) {
    const primary = items.find(item => item.currentOfficeHolder) || items.find(item => /^(chief minister|prime minister|president|governor|mayor) of /i.test(item.title || ""));
    if (!primary) return null;
    if (primary.currentOfficeHolder) {
        return `${cleanText(primary.currentOfficeHolder)} is the current office holder for ${cleanText(primary.title)}.`;
    }
    const match = cleanText(primary.answer).match(/^(.+?) is the current office holder for ((?:Chief Minister|Prime Minister|President|Governor|Mayor) of .+?)\./i);
    return match ? `${match[1]} is the current office holder for ${match[2]}.` : null;
}

function rankSentences(items, query) {
    const terms = queryTerms(query);
    const candidates = [];
    for (const item of items) {
        const sentences = splitSentences(item.answer || item.text || item.content || "");
        const title = cleanText(item.title).toLowerCase();
        for (const sentence of sentences) {
            const lower = sentence.toLowerCase();
            const matched = terms.reduce((total, term) => total + (lower.includes(term) ? 1 : 0), 0);
            const titleMatched = terms.reduce((total, term) => total + (title.includes(term) ? 1 : 0), 0);
            const sourceBoost = item.type === "research" ? 2 : item.currentOfficeHolder ? 3 : 0;
            const score = matched * 2 + titleMatched + sourceBoost + (Number(item.searchScore) || 0) * 0.05;
            if (score > 0) candidates.push({ sentence, score });
        }
    }
    const seen = new Set();
    return candidates
        .sort((a, b) => b.score - a.score)
        .filter(item => {
            const key = item.sentence.toLowerCase().slice(0, 140);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .slice(0, 5)
        .map(item => item.sentence);
}

function generateAnswer(knowledge, message) {
    try {
        const rawItems = Array.isArray(knowledge) ? knowledge : [];
        const items = rawItems.filter(item => {
            if (!item || typeof item !== "object") return false;
            const relevance = Number(item.relevanceScore ?? item.relevance);
            // Search orchestrator results expose a relevance score. When available,
            // enforce it again at the answer boundary so a low-ranked unrelated item
            // cannot leak into a model-off fallback. Local legacy knowledge without a
            // relevance field remains eligible.
            return !Number.isFinite(relevance) || relevance >= 8;
        });
        if (!items.length) return { answer: "I don't have enough reliable information to answer that confidently.", confidence: 0, tool: "knowledge" };

        if (isLatestGpuQuery(message)) {
            const answer = createGpuAnswer(items);
            if (answer) return { answer, confidence: 82, tool: "gpu-search" };
        }

        if (isListQuery(message)) {
            const answer = createGenericListAnswer(items);
            if (answer) return { answer, confidence: 76, tool: "list-search" };
        }

        if (isNewsQuery(message)) {
            const answer = createNewsAnswer(items);
            if (answer) return { answer, confidence: 80, tool: "news" };
        }

        if (isCurrentOfficeQuery(message)) {
            const answer = createCurrentOfficeAnswer(items);
            if (answer) return { answer, confidence: 90, tool: "current-office" };
            return { answer: "I found current-office information, but it did not provide a verified office-holder name. I don't want to guess.", confidence: 35, tool: "current-office" };
        }

        if (/\b(?:latest|newest|current|recent)\b/i.test(message)) {
            const answer = createCurrentFactAnswer(items, message);
            if (answer) return { answer, confidence: 72, tool: "current-fact" };
        }

        const factualItems = items
            .map(item => ({ ...item, _external: Boolean(item.url || item.provider) }))
            .sort((a, b) => {
                const externalBoost = Number(b._external) - Number(a._external);
                if (externalBoost) return externalBoost;
                return (Number(b.score) || Number(b.searchScore) || 0) - (Number(a.score) || Number(a.searchScore) || 0);
            });

        const facts = rankSentences(factualItems.slice(0, 6), message);
        if (!facts.length) {
            const fallback = createGeneralSearchFallback(factualItems, message);
            if (fallback) return { answer: fallback, confidence: 62, tool: "knowledge-fallback" };
            return { answer: "I don't have enough reliable information to answer that confidently.", confidence: 30, tool: "knowledge" };
        }

        const concise = facts.slice(0, /\b(explain|describe|details|why|how)\b/i.test(message) ? 4 : 2);
        return {
            answer: concise.join(" "),
            confidence: Math.min(95, 56 + concise.length * 8),
            tool: "knowledge"
        };
    } catch (error) {
        logger.error("Generator error:", error);
        return { answer: "Prime generation failed.", confidence: 0, tool: "knowledge" };
    }
}

module.exports = { generateAnswer };
