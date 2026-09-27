const queryDecomposer = require("../intelligence/queryDecomposer");

function buildPlan(query, state = {}) {
  const decomposed = queryDecomposer.decompose(query, state.recentConversation || []);
  const fresh = Boolean(state.needsFreshEvidence);
  const hasImages = Array.isArray(state.images) && state.images.length > 0;
  const plan = [];

  plan.push({ step: "understand", reason: "interpret intent, entities, follow-ups and corrections" });
  if (state.memoryContext) plan.push({ step: "memory", reason: "use relevant user memory" });
  if (hasImages) plan.push({ step: "vision", reason: "inspect the actual attached pixels" });
  if (fresh) plan.push({ step: "search", reason: "fresh evidence is required" });
  if (decomposed.isCompound) plan.push({ step: "decompose", subtasks: decomposed.subtasks.map(item => item.query) });
  plan.push({ step: "reason", reason: "synthesize tools, context and evidence" });
  plan.push({ step: "verify", reason: "check answer against available evidence" });
  plan.push({ step: "respond", reason: "produce a direct natural answer" });
  return { ...decomposed, plan };
}

module.exports = { buildPlan };
