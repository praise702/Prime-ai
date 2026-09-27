const path = require("path");
const config = require("../config/config");

const defaultOutputRoot = path.join(config.dataDir, "images");

function integer(name, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
    const value = Number.parseInt(process.env[name], 10);
    return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
}

function resolveOutputRoot() {
    const candidate = path.resolve(process.env.IMAGE_OUTPUT_DIR || defaultOutputRoot);
    const dataRoot = path.resolve(config.dataDir);
    if (candidate !== dataRoot && !candidate.startsWith(`${dataRoot}${path.sep}`)) {
        console.warn("[IMAGE] IMAGE_OUTPUT_DIR must stay inside PRIME_DATA_DIR; using the default image directory.");
        return defaultOutputRoot;
    }
    return candidate;
}

const outputRoot = resolveOutputRoot();
const allowedProviders = new Set(["local", "stability", "openai", "replicate"]);
const configuredProviderOrder = (process.env.IMAGE_PROVIDER_ORDER || "local,stability,openai,replicate")
    .split(",")
    .map(value => value.trim().toLowerCase())
    .filter(value => allowedProviders.has(value));

module.exports = {
    providerOrder: configuredProviderOrder.length ? configuredProviderOrder : ["local"],
    maxRetries: integer("IMAGE_MAX_RETRIES", 1, { min: 0, max: 3 }),
    maxRefinements: integer("IMAGE_MAX_REFINEMENTS", 0, { min: 0, max: 2 }),
    maxConcurrentJobs: integer("IMAGE_MAX_CONCURRENT_JOBS", 1, { min: 1, max: 4 }),
    maxWidth: integer("IMAGE_MAX_WIDTH", 1024, { min: 256, max: 4096 }),
    maxHeight: integer("IMAGE_MAX_HEIGHT", 1024, { min: 256, max: 4096 }),
    localServiceUrl: (process.env.PRIME_IMAGE_SERVICE_URL || "http://127.0.0.1:7861").replace(/\/$/, ""),
    localServiceTimeoutMs: integer("PRIME_IMAGE_SERVICE_TIMEOUT_MS", 1_200_000, { min: 1_000, max: 1_800_000 }),
    outputDirectories: {
        root: outputRoot,
        generated: path.join(outputRoot, "generated"),
        temporary: path.join(outputRoot, "temporary"),
        rejected: path.join(outputRoot, "rejected"),
        cache: path.join(outputRoot, "cache")
    }
};
