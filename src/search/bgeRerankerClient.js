const axios = require("axios");

function endpoint() { return String(process.env.PRIME_RERANKER_URL || "").trim(); }

async function rerank(query, results) {
  const url = endpoint();
  if (!url || !Array.isArray(results) || !results.length) return results;
  try {
    const response = await axios.post(url, {
      query,
      documents: results.map(item => String(item.text || item.title || "").slice(0, 4000))
    }, { timeout: 30_000, headers: { "Content-Type": "application/json" } });
    const scores = Array.isArray(response.data?.scores) ? response.data.scores : [];
    if (scores.length !== results.length) return results;
    return results.map((item, i) => ({ ...item, rerankScore: Number(scores[i]) || 0 }))
      .sort((a, b) => b.rerankScore - a.rerankScore);
  } catch {
    return results;
  }
}

module.exports = { rerank, enabled: () => Boolean(endpoint()) };
