const assert = require("assert");
const queryUnderstanding = require("../src/intelligence/queryUnderstanding");
const answerGenerator = require("../src/brain/answerGenerator");
const responseStyle = require("../src/brain/responseStyle");

function run() {
    const gta = queryUnderstanding.understandQuery("what is gta 5");
    assert.match(gta.normalizedQuery, /Grand Theft Auto V/i);

    const gpu = queryUnderstanding.understandQuery("LATEST 5 GPU");
    assert.equal(gpu.intent, "LATEST_GPU");

    const answer = answerGenerator.generateAnswer([
        { title: "Grand Theft Auto V - Rockstar Games", text: "Grand Theft Auto V is a game developed by Rockstar North and published by Rockstar Games.", url: "https://www.rockstargames.com/gta-v" }
    ], "what is Grand Theft Auto V");
    assert.match(answer.answer, /Grand Theft Auto V/i);
    assert.doesNotMatch(answer.answer, /not enough reliable information/i);

    const hidden = responseStyle.formatKnowledgeAnswer("Grand Theft Auto V is a game.\n\n---\n\n### 📚 Sources\n\nRockstar Games", "what is gta 5");
    assert.doesNotMatch(hidden, /Sources/i);

    console.log("Prime search-quality regression checks passed");
}

try { run(); } catch (error) { console.error(error); process.exit(1); }
