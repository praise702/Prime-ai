const assert = require("assert");
const normalizedSearch = require("../src/knowledge/normalizedSearch");
const agentGraph = require("../src/agent/agentGraph");
const hybridRetriever = require("../src/search/hybridRetriever");
const evidenceVerifier = require("../src/search/evidenceVerifier");
const emotionEngine = require("../src/emotion/emotionEngine");
const evaluator = require("../src/evals/primeEvaluator");

(async () => {
  const plan = agentGraph.buildPlan("compare the latest five phones and tell me which one has the best battery", { needsFreshEvidence: true, recentConversation: [] });
  assert.ok(plan.plan.some(x => x.step === "search"));
  assert.ok(plan.plan.some(x => x.step === "decompose"));

  const fused = hybridRetriever.fuse("latest five phones", [
    { title: "Phone A", text: "latest phone with battery" },
    { title: "Guitar guide", text: "music instrument" }
  ]);
  assert.strictEqual(fused[0].title, "Phone A");

  const verification = evidenceVerifier.verify("what is Prime", "Prime is an AI assistant.", [{ title: "Prime", text: "Prime is an AI assistant created by Praise Immanuel." }]);
  assert.ok(verification.approved);

  assert.strictEqual(emotionEngine.detectText("im sad bro").label, "sadness-or-distress");
  assert.strictEqual(emotionEngine.detectText("this is awesome").label, "positive");

  const metrics = evaluator.evaluateCase({ name: "simple", input: "what is a GPU", mustContain: ["gpu"] }, "A GPU is a graphics processing unit.");
  assert.ok(metrics.containsAll);

  const status = normalizedSearch.providerStatus();
  assert.ok("searxng" in status && "bgeReranker" in status && "embedding" in status);

  console.log("Prime intelligence stack regression tests passed.");
})();
