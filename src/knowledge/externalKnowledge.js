/*
 * Compatibility boundary for external knowledge.
 * Provider selection and result normalization live in normalizedSearch.js.
 */

const normalizedSearch = require("./normalizedSearch");

async function getExternalKnowledge(query, options = {}) {
    try {
        const results = await normalizedSearch.search(query, options);
        console.log(`🌐 Normalized external knowledge: ${results.length}`);
        return results;
    } catch (error) {
        console.log("❌ External search error:", error.message);
        return [];
    }
}

module.exports = { getExternalKnowledge };
