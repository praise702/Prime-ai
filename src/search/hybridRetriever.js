function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function tokens(text) {
  return normalize(text).split(" ").filter(t => t.length >= 2);
}

function lexicalScore(query, item) {
  const q = new Set(tokens(query));
  const title = tokens(item.title);
  const body = tokens(item.text);
  let score = 0;
  for (const term of q) {
    if (title.includes(term)) score += 4;
    else if (body.includes(term)) score += 1.5;
  }
  return score;
}

function cosine(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || !a.length) return 0;
  let dot = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; }
  return aa && bb ? dot / Math.sqrt(aa * bb) : 0;
}

function score(query, item, queryEmbedding = null) {
  const lexical = lexicalScore(query, item);
  const semantic = queryEmbedding && Array.isArray(item.embedding) ? cosine(queryEmbedding, item.embedding) * 12 : 0;
  return lexical + semantic;
}

function fuse(query, results, queryEmbedding = null) {
  return (Array.isArray(results) ? results : [])
    .map((item, index) => ({ ...item, hybridScore: score(query, item, queryEmbedding), lexicalRank: index + 1 }))
    .sort((a, b) => b.hybridScore - a.hybridScore);
}

module.exports = { fuse, cosine, lexicalScore };
