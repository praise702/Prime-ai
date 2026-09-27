const normalizedSearch = require("../knowledge/normalizedSearch");

async function search(query, options = {}) {
    const results = await normalizedSearch.search(query, options);
    return {
        query,
        results,
        source: "prime-web-search"
    };
}

module.exports = { search };
