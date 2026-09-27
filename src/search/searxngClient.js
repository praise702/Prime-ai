const axios = require("axios");

function baseUrl() {
  return String(process.env.SEARXNG_URL || "").trim().replace(/\/$/, "");
}

async function search(query, options = {}) {
  const base = baseUrl();
  if (!base) return [];
  try {
    const response = await axios.get(`${base}/search`, {
      params: {
        q: query,
        format: "json",
        language: options.language || process.env.SEARCH_LANGUAGE || "en-IN",
        safesearch: 1
      },
      timeout: Math.min(Number(options.timeoutMs || 10000), 20000),
      headers: { Accept: "application/json", "User-Agent": "Prime/3.5" }
    });
    return (response.data?.results || []).map(item => ({
      source: "SearXNG",
      provider: "searxng",
      type: options.news ? "news" : "web",
      title: item.title,
      text: [item.content, item.abstract].filter(Boolean).join(" "),
      url: item.url,
      publisher: item.engine_data?.publisher || item.parsed_url?.hostname || null,
      publishedAt: item.publishedDate || item.published_date || null,
      engine: item.engine
    }));
  } catch {
    return [];
  }
}

module.exports = { search, enabled: () => Boolean(baseUrl()) };
