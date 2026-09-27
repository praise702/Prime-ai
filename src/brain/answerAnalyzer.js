/* Evidence-aware gate used immediately before an answer is returned. */
const { classify } = require("../intelligence/queryUnderstanding");

function clean(value) { return String(value || "").replace(/[#*_`]/g, " ").replace(/\s+/g, " ").trim(); }
function words(value) {
    const stop = new Set(["what", "who", "where", "when", "why", "how", "with", "from", "that", "this", "there", "about", "which", "their", "they", "have", "been", "were", "will", "would", "could", "should", "into", "than", "then", "your", "latest", "current"]);
    return clean(value).toLowerCase().match(/[a-z0-9]{3,}/g)?.filter(word => !stop.has(word)) || [];
}
function relevanceScore(question, answer) {
    const queryWords = words(question);
    if (!queryWords.length) return 100;
    const answerWords = new Set(words(answer));
    return Math.round(100 * queryWords.filter(word => answerWords.has(word)).length / queryWords.length);
}
function sourceScore(sources) {
    if (!Array.isArray(sources) || !sources.length) return 0;
    const withText = sources.filter(source => clean(source.text).length >= 30).length;
    const withIdentity = sources.filter(source => source.title && source.source).length;
    return Math.min(100, withText * 35 + withIdentity * 15);
}
function duplicateCount(answer) {
    const seen = new Set(); let duplicates = 0;
    for (const sentence of clean(answer).split(/[.!?]\s*/).filter(Boolean)) {
        const key = sentence.toLowerCase().slice(0, 100);
        if (seen.has(key)) duplicates++; else seen.add(key);
    }
    return duplicates;
}
function unsupportedClaims(answer, sources) {
    const corpus = new Set(words(sources.map(source => `${source.title || ""} ${source.text || ""}`).join(" ")));
    if (!corpus.size) return 1;
    return clean(answer).split(/[.!?]\s*/).filter(sentence => sentence.length >= 25 && !/^latest news$/i.test(sentence) && !/^source:\s*/i.test(sentence)).filter(sentence => {
        const claimWords = words(sentence);
        const matched = claimWords.filter(word => corpus.has(word)).length;
        return claimWords.length >= 3 && matched < Math.max(2, Math.ceil(claimWords.length * 0.45));
    }).length;
}
function staleCurrentInformation(query, sources) {
    if (!/\b(current|latest|today|news|now|present)\b/i.test(query)) return false;
    if (!sources.length) return true;
    const now = Date.now();
    return sources.every(source => !source.retrievedAt || now - Date.parse(source.retrievedAt) > 24 * 60 * 60 * 1000);
}
function malformed(query, answer) {
    const intent = classify(query);
    if (intent === "NEWS") return !/latest headlines|latest news/i.test(String(answer)) || (String(answer).match(/^\s*- /gm) || []).length > 5;
    if (intent === "CURRENT_OFFICE_HOLDER") return !/(current (?:office holder|chief minister|prime minister|president|governor|mayor)|chief minister|prime minister|president|governor|mayor)/i.test(String(answer));
    return false;
}
function analyzeAnswer(question, answer, sources = [], options = {}) {
    const text = clean(answer);
    const empty = text.length < 20;
    const relevance = relevanceScore(question, text);
    const evidence = sourceScore(sources);
    const duplicates = duplicateCount(text);
    const modelGenerated = Boolean(options.modelGenerated);
    const unsupported = modelGenerated ? 0 : unsupportedClaims(text, sources);
    const stale = staleCurrentInformation(question, sources);
    const malformedOutput = modelGenerated ? false : malformed(question, answer);
    const requiresFreshEvidence = Boolean(options.requiresFreshEvidence);
    let qualityScore = 100 - duplicates * 10 - unsupported * 25;
    if (relevance < 50) qualityScore -= 25;
    if (!modelGenerated && evidence < 40) qualityScore -= 25;
    if (requiresFreshEvidence && evidence < 40) qualityScore -= 35;
    if (stale) qualityScore -= 25;
    if (empty || malformedOutput) qualityScore = 0;
    qualityScore = Math.max(0, Math.min(100, qualityScore));
    return {
        approved: !empty && relevance >= 40 && unsupported === 0 && !stale && !malformedOutput && (!requiresFreshEvidence || evidence >= 40) && qualityScore >= 60,
        qualityScore,
        analysis: { relevance, duplicates, unsupportedClaims: unsupported, sourceReliability: evidence, stale, malformedOutput },
        suggestion: qualityScore >= 60 ? "Answer quality acceptable" : "Use a safe evidence-limited fallback"
    };
}
module.exports = { analyzeAnswer };
