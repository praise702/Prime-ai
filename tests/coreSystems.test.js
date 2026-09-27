const assert = require("assert");
const brain = require("../src/brain/brain");
const math = require("../src/mathematics/mathEngine");
const memory = require("../src/memory/memoryManager");
const tools = require("../src/tools/toolRegistry");
const localRetriever = require("../src/knowledge/localRetriever");
const analyzer = require("../src/brain/answerAnalyzer");
const auth = require("../src/middleware/auth");
const controller = require("../src/api/controller");
const externalKnowledge = require("../src/knowledge/externalKnowledge");

const userA = `core-user-a-${Date.now()}`;
const userB = `core-user-b-${Date.now()}`;

function responseCapture() {
    return { statusCode: 200, payload: null, status(code) { this.statusCode = code; return this; }, json(payload) { this.payload = payload; return this; } };
}

async function run() {
    try {
        // Stage 2: explicit memory, paraphrase retrieval, unknown facts, and isolation.
        assert.match((await brain.processMessage("My name is Praise", userA)).answer, /remember/i);
        assert.match((await brain.processMessage("I love Makathi", userA)).answer, /remember/i);
        assert.match((await brain.processMessage("My favorite color is blue", userA)).answer, /remember/i);
        assert.match((await brain.processMessage("What color do I like?", userA)).answer, /blue/i);
        assert.match((await brain.processMessage("Who do I love?", userA)).answer, /Makathi/i);
        assert.match((await brain.processMessage("What is my birthday?", userA)).answer, /don't have that information saved/i);
        assert.match((await brain.processMessage("What is my name?", userB)).answer, /don't have that information saved/i);
        assert.equal(memory.recall(userB).name, undefined);

        // Stages 5, 3 and 4: recent follow-up uses the immediately supported topic.
        const originalSearch = externalKnowledge.getExternalKnowledge;
        externalKnowledge.getExternalKnowledge = async () => [{ title: "Albert Einstein", text: "Albert Einstein was a theoretical physicist who developed the theory of relativity.", source: "Wikimedia", url: "https://example.test/einstein", retrievedAt: new Date().toISOString() }];
        await brain.processMessage("Who is Albert Einstein?", userA);
        const followUp = await brain.processMessage("Tell me more about him.", userA);
        assert.match(followUp.answer, /Albert Einstein|theoretical physicist|relativity/i);
        externalKnowledge.getExternalKnowledge = originalSearch;

        // Stage 6 and 8: arithmetic is calculated by the allowlisted calculator only.
        assert.equal(math.calculate("2 + 2"), 4);
        assert.equal(math.calculate("25 * 4"), 100);
        assert.equal(math.calculate("585611 / 584"), 1002.7585616438);
        assert.equal(math.calculate("25% of 400"), 100);
        assert.equal(math.calculate("2 ^ 3"), 8);
        assert.equal(math.calculate("(2 + 3) * 4"), 20);
        assert.deepEqual(tools.allowedTools(), ["calculator"]);
        assert.equal(tools.execute("fileReader", { path: "package.json" }).ok, false);
        assert.equal(tools.execute("calculator", { expression: "2 + 2" }).result, 4);

        // Stage 7: local RAG chunks are bounded and do not depend on a service.
        const chunks = localRetriever.loadChunks();
        assert.ok(Array.isArray(chunks));
        assert.equal(localRetriever.retrieve("unrelated terminology").length, 0);

        // Stage 4: unsupported claims and stale current results are rejected.
        const quality = analyzer.analyzeAnswer("Who is Albert Einstein?", "Albert Einstein invented a fictional planet.", [{ title: "Albert Einstein", text: "Albert Einstein was a physicist.", source: "Wikimedia", url: "https://example.test", retrievedAt: new Date().toISOString() }]);
        assert.equal(quality.approved, false);

        // Stage 9: malformed client credentials are rejected before controller access.
        const unauthorized = responseCapture();
        await auth({ headers: {}, body: {} }, unauthorized, () => assert.fail("next must not run"));
        assert.equal(unauthorized.statusCode, 401);

        // Controller must prefer middleware identity over a forged body userId.
        const captured = responseCapture();
        await controller.chat({ body: { message: "What is my name?", userId: userA }, user: { id: userB } }, captured);
        assert.match(captured.payload.message.text, /don't have that information saved/i);

        // A new chat must not reuse the old chat's short-term follow-up context.
        const chatOne = `chat-one-${Date.now()}`;
        const chatTwo = `chat-two-${Date.now()}`;
        await brain.processMessage("Who is Albert Einstein?", userA, chatOne);
        const sameChat = await brain.processMessage("Tell me more about him.", userA, chatOne);
        assert.match(sameChat.query.normalizedQuery, /tell me more about him/i);
        const newChat = await brain.processMessage("Tell me more about him.", userA, chatTwo);
        assert.equal(newChat.query.normalizedQuery, "Tell me more about him.");

        const windowUser = `window-user-${Date.now()}`;
        const shortMemory = require("../src/memory/shortMemory");
        for (let index = 0; index < 55; index += 1) shortMemory.addMessage(windowUser, "user", `message-${index}`);
        assert.equal(shortMemory.count(windowUser), 50);
        assert.equal(shortMemory.getMemory(windowUser)[0].message, "message-5");
        assert.equal(shortMemory.addMessage(windowUser, "user", "message-54"), false);
        shortMemory.clearMemory(windowUser);
        console.log("core systems regression checks passed");
    } finally {
        memory.recall(userA); // validates the test's private namespace before removal
        require("../src/memory/longMemory").clearMemory(userA);
        require("../src/memory/longMemory").clearMemory(userB);
        require("../src/memory/shortMemory").clearMemory(userA);
        require("../src/memory/shortMemory").clearMemory(userB);
    }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
