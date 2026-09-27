const assert = require('assert');
const normalizedSearch = require('../src/knowledge/normalizedSearch');
const answerGenerator = require('../src/brain/answerGenerator');
const brain = require('../src/brain/brain');
const externalKnowledge = require('../src/knowledge/externalKnowledge');
const modelManager = require('../src/models/modelManager');

async function run() {
    const relevant = {
        title: 'Grand Theft Auto V - Rockstar Games',
        text: 'Grand Theft Auto V is an open-world action-adventure game developed by Rockstar North and published by Rockstar Games.',
        type: 'web', url: 'https://www.rockstargames.com/gta-v'
    };
    const irrelevant = {
        title: 'Grand Theft Auto Online Shark Cash Cards',
        text: 'Purchase online currency and access special offers.',
        type: 'web', url: 'https://example.com/other'
    };
    assert.equal(normalizedSearch.__test.isResultRelevant(relevant, 'what is gta 5'), true);
    assert.equal(normalizedSearch.__test.isResultRelevant({
        title: 'Ta-Nehisi Coates', text: 'An unrelated biography about a writer.', type: 'reference', url: 'https://example.com/unrelated'
    }, 'what is gta 5'), false);

    const genericFallback = answerGenerator.generateAnswer([
        { title: 'Unrelated result', text: 'This page discusses cooking recipes and kitchen tools.', url: 'https://example.com/cooking', relevanceScore: 5 },
        relevant
    ], 'what is gta 5');
    assert.match(genericFallback.answer, /Grand Theft Auto V/i);
    assert.doesNotMatch(genericFallback.answer, /cooking/i);

    const listFallback = answerGenerator.generateAnswer([
        { title: 'Xiaomi Pad 8', text: 'Latest tablet with a 3.2K display.', url: 'https://example.com/pad8', relevanceScore: 20 },
        { title: 'Xiaomi Pad 7', text: 'Tablet with a 3.2K display.', url: 'https://example.com/pad7', relevanceScore: 19 },
        { title: 'Redmi Pad 2 Pro', text: 'Tablet with a large display.', url: 'https://example.com/redmi', relevanceScore: 18 }
    ], 'latest 5 tablets');
    assert.match(listFallback.answer, /Xiaomi Pad 8/i);
    assert.match(listFallback.answer, /Redmi Pad 2 Pro/i);

    const previousEnabled = modelManager.enabled;
    const previousExternal = externalKnowledge.getExternalKnowledge;
    modelManager.enabled = () => false;
    externalKnowledge.getExternalKnowledge = async () => [
        { title: 'Python', text: 'Python is a high-level programming language known for readable syntax and broad use in automation and data analysis.', source: 'Mock', provider: 'mock', url: 'https://example.com/python', relevanceScore: 30 }
    ];
    const result = await brain.processMessage('what is python', 'global-fallback-user', 'global-fallback-chat');
    assert.match(result.answer, /Python/i);
    assert.doesNotMatch(result.answer, /not enough reliable information/i);
    modelManager.enabled = previousEnabled;
    externalKnowledge.getExternalKnowledge = previousExternal;

    console.log('Global search relevance/fallback regression checks passed');
}

run().catch(error => { console.error(error); process.exit(1); });
