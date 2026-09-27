const assert = require("assert");
const queryUnderstanding = require("../src/intelligence/queryUnderstanding");
const normalizedSearch = require("../src/knowledge/normalizedSearch");
const memoryContext = require("../src/memory/memoryContext");

function assertUnderstanding(input, normalizedQuery, intent) {
    const result = queryUnderstanding.understandQuery(input);
    assert.equal(result.originalQuery, input, `original query changed for: ${input}`);
    assert.equal(result.normalizedQuery, normalizedQuery, `normalization failed for: ${input}`);
    assert.equal(result.intent, intent, `intent failed for: ${input}`);
}

function run() {
    assertUnderstanding("who is the current cheif minister of tamil nadu", "who is the current chief minister of tamil nadu", "CURRENT_OFFICE_HOLDER");
    assertUnderstanding("who devoloped you", "who developed you", "PRIME_IDENTITY");
    assertUnderstanding("who developed prime", "who developed prime", "PRIME_IDENTITY");
    assertUnderstanding("what is prime", "what is prime", "PRIME_IDENTITY");
    assertUnderstanding("wich programming language is this", "which programming language is this", "NORMAL_KNOWLEDGE");
    assertUnderstanding("teh latest news", "the latest news", "NEWS");
    assertUnderstanding("can you recieve this", "can you receive this", "NORMAL_KNOWLEDGE");
    assertUnderstanding("who is einsteinn", "who is einstein", "NORMAL_KNOWLEDGE");
    assertUnderstanding("helo", "hello", "GREETING");
    assertUnderstanding("helllo", "hello", "GREETING");
    assertUnderstanding("whre is tamil nadu", "where is tamil nadu", "NORMAL_KNOWLEDGE");
    assertUnderstanding("what is teh latest news", "what is the latest news", "NEWS");
    assertUnderstanding("what is gta 5", "what is gta 5", "NORMAL_KNOWLEDGE");
    assertUnderstanding("whatt is the latest nvidia gpu", "what is the latest nvidia gpu", "LATEST_GPU");

    for (const input of ["WHO IS EINSTEIN", "Who is Einstein?", "who is einstein???", "who is einstein"]) {
        assert.equal(queryUnderstanding.understandQuery(input).intent, "NORMAL_KNOWLEDGE");
    }

    assertUnderstanding("who is the current cm of tamil nadu", "who is the current chief minister of tamil nadu", "CURRENT_OFFICE_HOLDER");
    assertUnderstanding("who is the current pm of india", "who is the current prime minister of india", "CURRENT_OFFICE_HOLDER");
    assertUnderstanding("what does ai mean", "what does artificial intelligence mean", "NORMAL_KNOWLEDGE");
    assertUnderstanding("what is a gpu", "what is a graphics processing unit", "NORMAL_KNOWLEDGE");
    assertUnderstanding("current cm tamil nadu", "current chief minister tamil nadu", "CURRENT_OFFICE_HOLDER");
    assert.equal(queryUnderstanding.understandQuery("create a roblox character").intent, "IMAGE");
    assert.equal(queryUnderstanding.understandQuery("create an image of a house").intent, "IMAGE");
    assert.equal(queryUnderstanding.understandQuery("558+84+").intent, "MATH");

    assertUnderstanding("what is the latest news", "what is the latest news", "NEWS");
    assertUnderstanding("latest GPU news", "latest GPU news", "NEWS");
    assertUnderstanding("what is the latest GPU", "what is the latest GPU", "LATEST_GPU");
    assertUnderstanding("latest NVIDIA GPU", "latest NVIDIA GPU", "LATEST_GPU");
    assertUnderstanding("what is the newest iPhone", "what is the newest iPhone", "CURRENT_FACT");

    for (const input of ["what is my name", "who am i", "who do i love", "who i love", "what do i love", "what do i like", "what do you remember about me"]) {
        assert.equal(queryUnderstanding.understandQuery(input).intent, "USER_MEMORY");
    }

    assert.equal(memoryContext.detectMemoryTopic("who do i love"), "loves");
    assert.equal(memoryContext.detectMemoryTopic("what do i love"), "loves");
    assert.equal(queryUnderstanding.understandQuery("who is Makathi").normalizedQuery, "who is Makathi");
    assert.equal(normalizedSearch.isNewsQuery("latest GPU"), false);
    assert.equal(normalizedSearch.isNewsQuery("latest GPU news"), true);
    assert.equal(normalizedSearch.isCurrentOfficeQuery("Tamil Nadu CM"), true);
    assert.equal(normalizedSearch.officeTitleFor("current cm tamil nadu"), "Chief Minister of Tamil Nadu");

    console.log("query-understanding regression checks passed");
}

run();
