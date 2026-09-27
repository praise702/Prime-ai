const modelConnector = require("./modelConnector");

function parseList(value) {
  return String(value || "").split(",").map(v => v.trim()).filter(Boolean);
}

function modelCandidates(kind = "chat") {
  const envName = kind === "vision" ? "PRIME_VISION_MODEL_FALLBACKS" : "PRIME_MODEL_FALLBACKS";
  const configured = parseList(process.env[envName]);
  if (configured.length) return configured;
  if (kind === "vision") return [modelConnector.visionModelName(), "qwen3-vl:8b", "gemma3:4b", "llava:7b"].filter(Boolean);
  return [modelConnector.modelName(), "qwen3:8b", "qwen2.5:7b", "llama3.1:8b", "gemma3:4b", "qwen2.5-coder:7b"].filter(Boolean);
}

async function generate(message, context, options = {}) {
  const candidates = [...new Set([options.model, ...modelCandidates("chat")].filter(Boolean))];
  for (const model of candidates) {
    const answer = await modelConnector.generate(message, context, { ...options, model, failureCooldownOverride: true });
    if (answer) return { answer, model, provider: modelConnector.provider() };
  }
  return null;
}

async function generateVision(message, context, images, options = {}) {
  const candidates = [...new Set([options.model, ...modelCandidates("vision")].filter(Boolean))];
  for (const model of candidates) {
    const answer = await modelConnector.generateVision(message, context, images, { ...options, model, failureCooldownOverride: true });
    if (answer) return { answer, model, provider: modelConnector.provider() };
  }
  return null;
}

module.exports = { generate, generateVision, modelCandidates };
