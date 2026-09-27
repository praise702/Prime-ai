/**
 * Compatibility API manager. The canonical web-search implementation lives in
 * normalizedSearch.js so Prime has one provider planner and one ranking path.
 */
const normalizedSearch = require("./normalizedSearch");

async function searchAll(query, options = {}) {
    return normalizedSearch.search(query, options);
}

function providerStatus() {
    return normalizedSearch.providerStatus();
}

module.exports = { searchAll, providerStatus };
