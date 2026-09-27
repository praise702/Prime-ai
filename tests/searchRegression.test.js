const assert = require("assert");

const normalizedSearch = require("../src/knowledge/normalizedSearch");
const brain = require("../src/brain/brain");

function run() {
    const news = normalizedSearch.normalizeGoogleNewsItem({
        title: ["Example headline"],
        description: ["<b>Example headline</b> with a concise summary."],
        link: ["https://example.test/article"],
        source: [{ _: "Example News" }],
        pubDate: ["Mon, 01 Jan 2026 10:00:00 GMT"]
    });

    assert.equal(news.type, "news");
    assert.equal(news.source, "Google News RSS");
    assert.equal(news.publisher, "Example News");
    assert.equal(news.text.includes("<b>"), false);
    assert.ok(news.publishedAt);

    const page = normalizedSearch.normalizeWikimediaPage({
        title: "List of chief ministers of Tamil Nadu",
        extract: "A concise encyclopedic summary about the Chief Minister of Tamil Nadu.",
        pageid: 123,
        fullurl: "https://en.wikipedia.org/wiki/List_of_chief_ministers_of_Tamil_Nadu",
        touched: "2026-01-01T00:00:00Z"
    });

    assert.equal(page.provider, "wikimedia");
    assert.equal(page.type, "reference");
    assert.equal(page.source, "Wikimedia");
    assert.equal(normalizedSearch.isNewsQuery("what is the latest news"), true);
    assert.equal(normalizedSearch.isCurrentOfficeQuery("who is the current cm of tamil nadu"), true);
    assert.equal(normalizedSearch.normalizeQuery("current cm of Tamil Nadu"), "current chief minister of Tamil Nadu");

    console.log("search regression checks passed");
}

run();


const providers = normalizedSearch.providerStatus();
assert.equal(Object.prototype.hasOwnProperty.call(providers, ["t","a","v","i","l","y"].join("")), false);
assert.equal(providers.duckduckgo, true);
console.log("search provider regression checks passed");

const browserSearch = require("../src/search/browserSearch");
const browserResults = browserSearch.parseBing(`
    <li class="b_algo"><h2><a href="https://example.com/a">Example A</a></h2><p>Useful result A.</p></li>
    <li class="b_algo"><h2><a href="https://example.org/b">Example B</a></h2><p>Useful result B.</p></li>
`);
assert.equal(browserResults.length, 2);
assert.equal(browserResults[0].provider, "browser");
assert.equal(browserResults[0].title, "Example A");
console.log("browser search parser checks passed");
