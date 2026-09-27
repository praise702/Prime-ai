const assert = require("assert");

process.env.PRIME_MODEL_ENABLED = "true";
process.env.SEARCH_FETCH_PAGES = "false";
process.env.SEARCH_BROWSER_FALLBACK = "false";

const fs = require("fs");
const os = require("os");
const path = require("path");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prime-regression-"));
process.env.PRIME_DATA_DIR = tempDir;

const queryUnderstanding = require("../src/intelligence/queryUnderstanding");
const identityKnowledge = require("../src/knowledge/identityKnowledge");
const modelManager = require("../src/models/modelManager");
const externalKnowledge = require("../src/knowledge/externalKnowledge");
const brain = require("../src/brain/brain");

async function run() {
    // Intent understanding should preserve entities, fix obvious typos, and
    // route Prime-specific questions without web retrieval.
    const gta = queryUnderstanding.understandQuery("what is gta 5");
    assert.equal(gta.normalizedQuery, "what is gta 5");
    assert.equal(gta.intent, "NORMAL_KNOWLEDGE");

    const typo = queryUnderstanding.understandQuery("who devoloped you");
    assert.equal(typo.normalizedQuery, "who developed you");
    assert.equal(typo.intent, "PRIME_IDENTITY");
    assert.equal(typo.correctionApplied, true);

    assert.equal(
        queryUnderstanding.understandQuery("what can you do").intent,
        "PRIME_IDENTITY"
    );

    const identity = identityKnowledge.search("who developed you");
    assert.match(identity, /Praise Immanuel/);

    const previousEnabled = modelManager.enabled;
    const previousAskModel = modelManager.askModel;
    const previousExternal = externalKnowledge.getExternalKnowledge;

    let modelCall = null;

    modelManager.enabled = () => true;
    modelManager.askModel = async (message, context, options) => {
        modelCall = { message, context, system: options.system };
        return "Grand Theft Auto V (GTA V) is an open-world action-adventure game developed by Rockstar North and published by Rockstar Games. It was released in 2013 and is set in the fictional state of San Andreas.\n\nIt is widely known for its single-player story and GTA Online multiplayer mode.";
    };
    externalKnowledge.getExternalKnowledge = async () => [
        {
            title: "Grand Theft Auto V",
            text: "Grand Theft Auto V is an open-world action-adventure game developed by Rockstar North and published by Rockstar Games.",
            source: "Mock reference",
            provider: "mock",
            url: "https://example.com/gta-v",
            retrievedAt: new Date().toISOString()
        }
    ];

    const result = await brain.processMessage("what is gta 5", "regression-user", "gta-chat");
    assert.ok(modelCall, "general knowledge should reach the language model");
    assert.equal(modelCall.message, "what is gta 5");
    assert.match(modelCall.context, /Original user request:\nwhat is gta 5/);
    assert.match(result.answer, /Grand Theft Auto V/);
    assert.doesNotMatch(result.answer, /Retrieved item|Mock reference|source list/i);

    modelManager.enabled = previousEnabled;
    modelManager.askModel = previousAskModel;
    externalKnowledge.getExternalKnowledge = previousExternal;

    // The calculator path must work without depending on the language model.
    modelManager.enabled = () => false;
    const math = await brain.processMessage("54564+554", "regression-math", "math-chat");
    assert.equal(math.answer, "55118");
    assert.equal(math.tool, "calculator");
    modelManager.enabled = previousEnabled;

    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log("Prime behavior regression checks passed");
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
