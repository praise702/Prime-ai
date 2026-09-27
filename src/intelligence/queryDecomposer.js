const STOP = new Set(["a","an","the","is","are","was","were","to","of","for","and","or","in","on","with","me","you","your","please"]);

function sentenceParts(query) {
  return String(query || "")
    .split(/\?|\!|\.|;|\n/) .map(s => s.trim()).filter(Boolean);
}

function splitCompound(query) {
  const text = String(query || "").trim();
  const parts = text.split(/\s+(?:and|also|plus|then)\s+/i).map(s => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : [text];
}

function topicTerms(text) {
  return String(text || "").toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)?.filter(w => !STOP.has(w)).slice(0, 12) || [];
}

function decompose(query, context = []) {
  const original = String(query || "").trim();
  const base = splitCompound(original).flatMap(sentenceParts).filter(Boolean);
  const questions = base.length ? base : [original];
  const subtasks = questions.map((q, index) => ({
    id: index + 1,
    query: q,
    terms: topicTerms(q),
    type: /\b(compare|versus|vs\.?|difference)\b/i.test(q) ? "comparison" : /\b(latest|current|today|news|recent)\b/i.test(q) ? "fresh" : "general"
  }));
  const contextTerms = Array.isArray(context)
    ? context.flatMap(item => topicTerms(item?.message || item)).slice(-12)
    : [];
  return { original, isCompound: subtasks.length > 1, subtasks, contextTerms };
}

module.exports = { decompose };
