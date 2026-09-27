const assert = require("assert");

process.env.SEARCH_FETCH_PAGES = "false";
process.env.SEARCH_BROWSER_FALLBACK = "false";
delete process.env.BRAVE_SEARCH_API_KEY;

const axios = require("axios");
const normalizedSearch = require("../src/knowledge/normalizedSearch");

const originalGet = axios.get;
const calls = [];

axios.get = async (url, options = {}) => {
    calls.push({ url, options });

    if (url === "https://html.duckduckgo.com/html/") {
        const q = String(options.params?.q || "");
        return {
            data: `<div class="result">\n                <a class="result__a" href="https://example.com/search">Example Search Result</a>\n                <a class="result__snippet">A useful search result for ${q} with enough context to pass normalization.</a>\n            </div>`
        };
    }

    if (url === "https://en.wikipedia.org/w/api.php") {
        return {
            data: {
                query: {
                    pages: {
                        "123": {
                            title: "Example Search Result",
                            extract: "An independent reference summary for the example search result with useful context.",
                            pageid: 123,
                            fullurl: "https://en.wikipedia.org/wiki/Example_Search_Result",
                            touched: "2026-01-01T00:00:00Z"
                        }
                    }
                }
            }
        };
    }

    throw new Error(`Unexpected URL in mock search: ${url}`);
};

async function run() {
    try {
        const results = await normalizedSearch.search("coffee", {
            location: { latitude: 11.0168, longitude: 76.9558 }
        });

        assert.ok(results.length >= 2, "expected multiple normalized providers");
        const providers = new Set(results.map(item => item.provider));
        assert.equal(providers.has("duckduckgo"), true);
        assert.equal(providers.has("wikimedia"), true);
        assert.ok(calls.some(item =>
            item.url === "https://html.duckduckgo.com/html/" &&
            String(item.options.params?.q || "").includes("near 11.017 76.956")
        ), `location should be passed to web search query; calls=${JSON.stringify(calls)}`);
        console.log("search integration mock checks passed");
    } finally {
        axios.get = originalGet;
    }
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
