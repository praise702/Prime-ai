require("dotenv").config();

function numberSetting(name, fallback, minimum, maximum) {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value >= minimum && value <= maximum ? value : fallback;
}

function booleanSetting(name, fallback = false) {
    const value = String(process.env[name] ?? "").trim().toLowerCase();
    if (value === "true") return true;
    if (value === "false") return false;
    return fallback;
}

function originList(value) {
    return String(value || "")
        .split(",")
        .map(v => v.trim())
        .filter(v => /^https?:\/\/[^/]+$/i.test(v));
}

const environment = process.env.NODE_ENV || "development";
const defaultDataDir = require("path").join(__dirname, "../../data");
const dataDir = require("path").resolve(process.env.PRIME_DATA_DIR || defaultDataDir);

module.exports = {
    appName: "Prime",
    version: "3.5.0",
    port: numberSetting("PORT", 3000, 1, 65535),
    environment,
    allowedOrigins: originList(process.env.CORS_ALLOWED_ORIGINS || `http://localhost:${process.env.PORT || 3000}`),
    requestBodyLimit: process.env.REQUEST_BODY_LIMIT || "12mb",
    maxUploadBytes: numberSetting("MAX_UPLOAD_BYTES", 8 * 1024 * 1024, 1024, 20 * 1024 * 1024),
    enableHsts: environment === "production" && booleanSetting("ENABLE_HSTS", true),
    trustProxy: environment === "production" && booleanSetting("TRUST_PROXY", true),
    secureCookies: environment === "production" ? booleanSetting("SECURE_COOKIES", true) : false,
    sessionTtlMs: numberSetting("SESSION_TTL_MS", 30 * 24 * 60 * 60 * 1000, 60_000, 365 * 24 * 60 * 60 * 1000),
    passwordMinLength: numberSetting("PASSWORD_MIN_LENGTH", 8, 8, 128),
    dataDir,
    rateLimit: {
        ip: { windowMs: numberSetting("RATE_LIMIT_IP_WINDOW_MS", 60_000, 1_000, 86_400_000), max: numberSetting("RATE_LIMIT_IP_MAX", 60, 1, 10_000) },
        burst: { windowMs: numberSetting("RATE_LIMIT_BURST_WINDOW_MS", 10_000, 1_000, 86_400_000), max: numberSetting("RATE_LIMIT_BURST_MAX", 12, 1, 10_000) },
        user: { windowMs: numberSetting("RATE_LIMIT_USER_WINDOW_MS", 60_000, 1_000, 86_400_000), max: numberSetting("RATE_LIMIT_USER_MAX", 30, 1, 10_000) },
        image: { windowMs: numberSetting("RATE_LIMIT_IMAGE_WINDOW_MS", 60_000, 1_000, 100) },
        auth: { windowMs: numberSetting("RATE_LIMIT_AUTH_WINDOW_MS", 15 * 60_000, 1_000, 86_400_000), max: numberSetting("RATE_LIMIT_AUTH_MAX", 10, 1, 100) },
        signup: { windowMs: numberSetting("RATE_LIMIT_SIGNUP_WINDOW_MS", 60 * 60_000, 1_000, 86_400_000), max: numberSetting("RATE_LIMIT_SIGNUP_MAX", 5, 1, 100) }
    },
    search: {
        timeoutMs: numberSetting("SEARCH_TIMEOUT_MS", 10_000, 1_000, 30_000),
        maxResultsPerSource: numberSetting("SEARCH_RESULTS_PER_SOURCE", 8, 1, 20),
        maxFinalResults: numberSetting("SEARCH_MAX_RESULTS", 40, 5, 80),
        cacheTtlMs: numberSetting("SEARCH_CACHE_TTL_MS", 60_000, 0, 10 * 60_000),
        maxQueryLength: numberSetting("SEARCH_MAX_QUERY_LENGTH", 500, 32, 2_000),
        browserFallbackEnabled: booleanSetting("SEARCH_BROWSER_FALLBACK", environment !== "production"),
        fetchPages: booleanSetting("SEARCH_FETCH_PAGES", true),
        pageFetchTopResults: numberSetting("SEARCH_PAGE_FETCH_TOP_RESULTS", 5, 0, 10),
        pageFetchTimeoutMs: numberSetting("SEARCH_PAGE_FETCH_TIMEOUT_MS", 7_000, 1_000, 20_000),
        pageMaxBytes: numberSetting("SEARCH_PAGE_MAX_BYTES", 1_500_000, 100_000, 5_000_000),
        pageTextMaxLength: numberSetting("SEARCH_PAGE_TEXT_MAX_LENGTH", 1_600, 400, 5_000),
        braveCountry: String(process.env.SEARCH_COUNTRY || "IN").trim().toUpperCase().slice(0, 2),
        braveLanguage: String(process.env.SEARCH_LANGUAGE || "en").trim().toLowerCase().slice(0, 12),
        searxngUrl: String(process.env.SEARXNG_URL || "").trim(),
        rerankerUrl: String(process.env.PRIME_RERANKER_URL || "").trim(),
        embeddingUrl: String(process.env.PRIME_EMBEDDING_URL || "").trim()
    }
};
