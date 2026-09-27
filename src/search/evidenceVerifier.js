function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function terms(query) {
  const stop = new Set(["what","who","where","when","why","how","is","are","the","a","an","of","to","for","me","tell","about","latest","current","recent","today","now"]);
  return normalize(query).split(" ").filter(w => w.length >= 3 && !stop.has(w)).slice(0, 20);
}

function supportScore(claim, evidence) {
  const ct = new Set(terms(claim));
  const text = normalize(evidence);
  let hit = 0;
  for (const t of ct) if (text.includes(t)) hit++;
  return ct.size ? hit / ct.size : 0;
}

function verify(query, answer, sources = []) {
  const evidence = (Array.isArray(sources) ? sources : []).map(s => `${s.title || ""} ${s.text || ""}`).join(" ");
  const sentences = String(answer || "").split(/(?<=[.!?])\s+/).filter(Boolean);
  const checks = sentences.map(sentence => ({ sentence, support: supportScore(sentence, evidence) }));
  const factual = checks.length ? checks.filter(x => x.support >= 0.16).length / checks.length : 0;
  const relevant = supportScore(query, evidence);
  return { approved: !sources.length || factual >= 0.35 || relevant >= 0.2, factualSupport: factual, querySupport: relevant, checks };
}

module.exports = { verify };
