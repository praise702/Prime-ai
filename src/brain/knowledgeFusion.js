/*
================================================
🧠 Prime KNOWLEDGE FUSION ENGINE v7
================================================

Combines Prime's local knowledge with web evidence,
then ranks for relevance, authority, freshness and evidence quality.

================================================
*/

const SOURCE_SCORES = {
    "prime knowledge": 100,
    "research search": 92,
    "news search": 86,
    "learning search": 84,
    "reference search": 82,
    "community search": 68,
    "web search": 72,
    "web context": 80,
    wikipedia: 90,
    wikimedia: 90,
    arxiv: 95,
    openalex: 94,
    crossref: 92,
    brave: 80,
    "brave-context": 84,
    wikibooks: 84,
    "google-news-rss": 86,
    "hacker-news": 68
};

function cleanText(text) {
    return String(text || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/\[[0-9]+\]/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 2_000);
}

function canonicalUrl(url) {
    if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return null;
    try {
        const parsed = new URL(url);
        parsed.hash = "";
        for (const key of [...parsed.searchParams.keys()]) {
            if (/^(utm_|fbclid|gclid|msclkid|ref|ref_src|source)$/i.test(key)) parsed.searchParams.delete(key);
        }
        return parsed.toString().replace(/\/$/, "");
    } catch { return null; }
}

function hostname(url) {
    try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
}

function sourceScore(item) {
    const source = String(item.source || "").toLowerCase();
    const provider = String(item.provider || "").toLowerCase();
    let score = SOURCE_SCORES[source] || SOURCE_SCORES[provider] || 40;
    const host = hostname(item.url);
    if (/\.gov(?:\.[a-z]{2,})?$|\.edu(?:\.[a-z]{2,})?$/i.test(host)) score += 8;
    if (/who\.int$|nasa\.gov$|nih\.gov$/i.test(host)) score += 8;
    if (/nature\.com$|science\.org$/i.test(host)) score += 7;
    if (item.type === "research") score += 4;
    if (item.url) score += 2;
    return Math.min(100, score);
}

function validText(text) {
    if (text.length < 30) return false;
    return !/\b(cookie(?: policy)?|privacy policy|enable javascript|subscribe now|advertisement|search api|table of contents|sign in|login)\b/i.test(text);
}

function relevance(query, text, title = "") {
    const normalize = value => String(value || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
    const words = normalize(query).split(" ").filter(word => word.length > 2 && !/^(what|who|where|when|why|how|the|and|for|with|this|that|current|latest|today)$/.test(word));
    if (!words.length) return 50;
    const body = normalize(text);
    const heading = normalize(title);
    let matched = 0;
    let score = 0;
    for (const word of words) {
        if (heading.includes(word)) { matched += 1; score += 2; }
        else if (body.includes(word)) { matched += 1; score += 1; }
    }
    const coverage = matched / words.length;
    return Math.round(Math.min(100, coverage * 80 + score * 4));
}

function freshness(item, query) {
    if (!item.publishedAt) return 0;
    const timestamp = Date.parse(item.publishedAt);
    if (Number.isNaN(timestamp)) return 0;
    const ageDays = Math.max(0, (Date.now() - timestamp) / 86_400_000);
    const latest = /\b(current|latest|today|now|present|recent|news|breaking)\b/i.test(query);
    if (latest) return Math.max(0, 12 - ageDays / 2);
    return Math.max(0, 5 - ageDays / 120);
}

function sameAnswerKey(item) {
    const url = canonicalUrl(item.url);
    if (url) return `url:${url.toLowerCase()}`;
    return `text:${cleanText(item.text || item.answer).toLowerCase().slice(0, 220)}`;
}

function removeDuplicates(items) {
    const used = new Set();
    return items.filter(item => {
        const key = sameAnswerKey(item);
        if (!key || used.has(key)) return false;
        used.add(key);
        return true;
    });
}

function calculateScore(item, query, corroboration = 0) {
    const trust = Number(item.trust || sourceScore(item));
    const rel = Number(item.relevance || 0);
    const fresh = freshness(item, query);
    const diversity = corroboration > 1 ? Math.min(8, corroboration * 2) : 0;
    const quality = item.text.length > 250 ? 6 : item.text.length < 80 ? -4 : 0;
    return Math.round(trust * 0.38 + rel * 0.42 + fresh + diversity + quality);
}

function fuseKnowledge(data, query = "") {
    try {
        if (!Array.isArray(data)) return [];

        const normalized = [];
        for (const item of data) {
            if (!item || typeof item !== "object") continue;
            const text = cleanText(item.text || item.content || item.answer || item.fact?.answer || item.fact?.text || "");
            if (!validText(text)) continue;
            const trust = sourceScore(item);
            const rel = relevance(query, text, item.title);
            if (query && rel < 12) continue;
            normalized.push({
                title: cleanText(item.title || item.question || ""),
                text,
                answer: text,
                url: canonicalUrl(item.url),
                source: item.source || "Web",
                type: item.type || "reference",
                provider: item.provider || null,
                publisher: item.publisher || null,
                publishedAt: item.publishedAt || null,
                retrievedAt: item.retrievedAt || null,
                trust,
                relevance: rel
            });
        }

        const deduped = removeDuplicates(normalized);
        const topicKey = item => (item.title || item.publisher || hostname(item.url) || "").toLowerCase();
        const topHosts = new Map();
        for (const item of deduped) {
            const host = hostname(item.url) || topicKey(item);
            topHosts.set(host, (topHosts.get(host) || 0) + 1);
        }

        deduped.forEach(item => {
            const host = hostname(item.url) || topicKey(item);
            item.score = calculateScore(item, query, topHosts.get(host) === 1 ? 1 : 2);
        });
        deduped.sort((a, b) => b.score - a.score);
        return deduped.slice(0, 20);
    } catch (error) {
        console.log("❌ Fusion Error:", error.message);
        return [];
    }
}

module.exports = { fuseKnowledge, sourceScore, relevance };
