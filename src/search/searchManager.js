const normalizedSearch = require("../knowledge/normalizedSearch");

async function searchKnowledge(query, options = {}) {
    const results = await normalizedSearch.search(query, options);
    const facts = results.slice(0, 10).map(item => ({
        fact: item.text,
        title: item.title,
        url: item.url,
        source: item.source,
        provider: item.provider,
        importance: Math.max(1, Math.round(item.score || 1))
    }));
    return {
        facts,
        confidence: facts.length ? Math.min(98, 60 + facts.length * 3) : 0,
        source: "Prime Web Search"
    };
}

module.exports = { searchKnowledge };
