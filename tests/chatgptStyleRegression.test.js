const assert = require("assert");
const queryUnderstanding = require("../src/intelligence/queryUnderstanding");
const responseStyle = require("../src/brain/responseStyle");
const memoryManager = require("../src/memory/memoryManager");
const memoryContext = require("../src/memory/memoryContext");

function run() {
  assert.equal(queryUnderstanding.understandQuery("okb ro").correctedQuery, "ok bro");
  assert.equal(queryUnderstanding.understandQuery("from now call me bro").intent, "USER_MEMORY");
  assert.equal(queryUnderstanding.understandQuery("do you know about chatgpt").intent, "NORMAL_KNOWLEDGE");
  assert.equal(queryUnderstanding.understandQuery("what is the latest gpu").needsFreshEvidence, true);
  assert.equal(queryUnderstanding.understandQuery("latest 5 tablets").intent, "LATEST_LIST");
  assert.equal(queryUnderstanding.understandQuery("i am sad").intent, "EMOTIONAL_SUPPORT");
  const conversationDetector = require("../src/intelligence/conversationDetector");
  const sadReply = conversationDetector.detect("i am sad");
  assert.equal(sadReply.matched, true);
  assert.match(sadReply.reply, /sorry.*feeling|here with you/i);
  const naturalSadReply = conversationDetector.detect("im sad bro");
  assert.equal(naturalSadReply.matched, true);
  assert.match(naturalSadReply.reply, /here with you/i);
  const humanReply = conversationDetector.detect("how are you");
  assert.equal(humanReply.matched, true);
  assert.match(humanReply.reply, /bro/i);
  assert.equal(typeof memoryManager.detectMemory("from now call me bro", "test-user"), "object");
  assert.match(memoryContext.buildMemoryContext("test-user", "anything"), /bro/i);
  assert.equal(responseStyle.sanitizeAssistantOutput("\\### Main answer\\n\\n**Key points**").includes("### Main answer"), true);
  assert.equal(responseStyle.sanitizeAssistantOutput("Answer\n\n---\n### 📚 Sources\n1. hidden").includes("Sources"), false);
  console.log("ChatGPT-style routing/output regression checks passed");
}
run();
