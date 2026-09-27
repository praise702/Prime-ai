/**
 * Prime Search Orchestrator v3
 *
 * This is Prime's search layer: it plans the search, fans out to several
 * independent indexes/verticals, normalizes evidence, removes duplicates,
 * scores relevance/freshness/authority, and returns a compact research set.
 *
 * Providers are adapters. No provider is trusted as the sole source of truth.
 * Keys stay server-side and provider names are never required by the UI.
 */

const axios = require("axios");
const { parseStringPromise } = require("xml2js");
const config = require("../config/config");
const { classify } = require("../intelligence/queryUnderstanding");
const browserSearch = require("../search/browserSearch");
const searxngClient = require("../search/searxngClient");
const hybridRetriever = require("../search/hybridRetriever");
const bgeReranker = require("../search/bgeRerankerClient");
const semanticMemory = require("../memory/semanticMemory");

const SEARCH = config.search;
const USER_AGENT = "Prime/2.2 (+self-hosted search orchestrator)";
const COMMON_HEADERS = {
    "User-Agent": USER_AGENT,
    Accept: "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

const cache = new Map();
const inflight = new Map();
const MAX_CACHE_ENTRIES = 300;

const STOP_WORDS = new Set([
    "what", "who", "where", "when", "why", "how", "is", "are", "was", "were",
    "the", "a", "an", "of", "to", "for", "in", "on", "and", "or", "with",
    "me", "please", "tell", "about", "can", "could", "would", "should", "do", "does", "did", "you", "your", "know", "like", "want", "need", "latest",
    "current", "today", "recent", "news"
]);

const TRUSTED_DOMAIN_BONUS = [
    [/(^|\.)gov(?:\.in|\.uk|\.au|\.nz|)$/i, 8],
    [/(^|\.)gov\.([a-z]{2,})$/i, 7],
    [/(^|\.)edu(?:\.[a-z]{2,})?$/i, 6],
    [/(^|\.)who\.int$/i, 8],
    [/(^|\.)nasa\.gov$/i, 8],
    [/(^|\.)nih\.gov$/i, 8],
    [/(^|\.)nature\.com$/i, 8],
    [/(^|\.)science\.org$/i, 8],
    [/(^|\.)arxiv\.org$/i, 7],
    [/(^|\.)openalex\.org$/i, 6],
    [/(^|\.)wikipedia\.org$/i, 4],
    [/(^|\.)nvidia\.com$/i, 9],
    [/(^|\.)amd\.com$/i, 9],
    [/(^|\.)intel\.com$/i, 9]
];

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function cleanText(value, max = 1_200) {
    return String(value || "")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&#x2F;|&#47;/gi, "/")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max);
}

function normalizeQuery(query) {
    return cleanText(query, SEARCH.maxQueryLength)
        .replace(/\bcm\b/gi, "chief minister")
        .replace(/\bpm\b/gi, "prime minister")
        .replace(/\b(ai)\b/gi, "artificial intelligence")
        .replace(/\bgta\s*(?:5|v)\b/gi, "Grand Theft Auto V")
        .replace(/\bgta\s+online\b/gi, "Grand Theft Auto Online")
        .replace(/[^\p{L}\p{N}\s:/.-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function classifyQuery(query) {
    let kind = "GENERAL";
    try { kind = classify(query) || kind; } catch {}
    const text = normalizeQuery(query).toLowerCase();

    const explicitNews = /\b(news|headlines|breaking|new developments|top stories|latest headlines)\b/i.test(text);
    const recencyNews = /\b(latest|today|recent|this week|this month|yesterday)\b/i.test(text) && /\b(news|headlines|stories|happened|update|updates)\b/i.test(text);
    const news = kind === "NEWS" || explicitNews || recencyNews;
    const current = /\b(current|present|now|who is the .+? in )\b/i.test(text) || kind === "CURRENT_FACT" || kind === "LATEST_GPU" || kind === "CURRENT_OFFICE_HOLDER";
    const research = /\b(research|paper|study|experiment|journal|academic|citation|scientific|science|dataset|benchmark|arxiv|doi)\b/i.test(text);
    const learning = /\b(learn|tutorial|guide|course|how to|documentation|docs|example|reference)\b/i.test(text);
    const shopping = /\b(price|cost|buy|purchase|deal|review|reviews|best \w+ under|compare \w+|vs\.?|specifications|specs)\b/i.test(text);
    const local = /\b(near me|nearby|in my area|restaurant|hotel|store|shop|hospital|school)\b/i.test(text);
    const code = /\b(api|sdk|github|npm|python|javascript|typescript|node\.js|react|express|docker|kubernetes|code|programming|library|framework)\b/i.test(text);
    const gpu = /\b(?:gpu|gpus|graphics card|graphics cards|geforce|radeon|arc gpu)\b/i.test(text);
    const genericList = /\b(?:latest|newest|current|recent|top)\b/i.test(text) && /\b(?:5|five|10|ten)\b/i.test(text);
    const currentList = kind === "LATEST_GPU" || kind === "LATEST_LIST" || genericList || (gpu && /\b(?:latest|newest|current)\b/i.test(text));

    return { kind, news, current, research, learning, shopping, local, code, gpu, currentList, genericList, text };
}

function isNewsQuery(query) { return classifyQuery(query).news; }
function isCurrentOfficeQuery(query) {
    const text = normalizeQuery(query).toLowerCase();
    const office = /\b(chief minister|prime minister|president|governor|mayor)\b/.test(text);
    const explicitCurrent = /\b(current|present|now|today)\b/.test(text);
    const contextualOffice = /\b(tamil nadu|india)\b/.test(text);
    return office && (explicitCurrent || contextualOffice);
}

function toIsoDate(value) {
    const time = Date.parse(value || "");
    return Number.isNaN(time) ? null : new Date(time).toISOString();
}

function canonicalUrl(value) {
    if (typeof value !== "string" || !/^https?:\/\//i.test(value)) return null;
    try {
        const url = new URL(value);
        url.hash = "";
        for (const key of [...url.searchParams.keys()]) {
            if (/^(utm_|fbclid|gclid|msclkid|ref|ref_src|source)$/i.test(key)) url.searchParams.delete(key);
        }
        return url.toString().replace(/\/$/, "");
    } catch {
        return null;
    }
}

function hostname(value) {
    try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
}

function isUseful(text, type = "reference") {
    const minimum = type === "news" ? 8 : 30;
    return text.length >= minimum && !/\b(cookie policy|privacy policy|terms of service|sign in|sign up|enable javascript|advertisement|subscribe now|table of contents)\b/i.test(text);
}

function result({ source, provider, type = "reference", title, text, url = null, publisher = null, publishedAt = null, extra = {} }) {
    const cleanTitle = cleanText(title, 300);
    const cleanBody = cleanText(text, 1_200);
    const normalizedUrl = canonicalUrl(url);
    if (!cleanTitle || !isUseful(cleanBody, type)) return null;

    return {
        source,
        provider,
        type,
        title: cleanTitle,
        text: cleanBody,
        url: normalizedUrl,
        publisher: cleanText(publisher, 180) || (normalizedUrl ? hostname(normalizedUrl) : null),
        publishedAt: toIsoDate(publishedAt),
        retrievedAt: new Date().toISOString(),
        ...extra
    };
}

function extractTopicText(query) {
    let text = normalizeQuery(query).trim();
    text = text
        .replace(/^(?:do you know about|do you know|tell me about|tell me|what do you know about|explain|describe|give me information about|information about|what is|what are|who is|who are|where is|where are|when is|when was|why is|why are|how does|how do|how is|how are|what does)\s+/i, "")
        .replace(/^(?:the|a|an)\s+/i, "")
        .replace(/\b(?:latest|newest|current|recent|today|now|news|top|five|5|ten|10)\b/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
    return text;
}

function queryTerms(query) {
    return extractTopicText(query)
        .toLowerCase()
        .match(/[\p{L}\p{N}]{2,}/gu)?.filter(term => !STOP_WORDS.has(term)) || [];
}

function queryVariants(query) {
    const info = classifyQuery(query);
    const normalized = normalizeQuery(query);
    if (info.currentList) {
        if (info.gpu) {
            return [
                "latest NVIDIA GeForce GPUs 2026 official",
                "latest AMD Radeon GPUs 2026 official",
                "latest Intel Arc GPUs 2026 official",
                "latest desktop graphics cards 2026"
            ];
        }
        const genericListTopic = extractTopicText(normalized)
            .replace(/\b(?:latest|newest|current|recent|top|5|five|10|ten)\b/gi, " ")
            .replace(/\s+/g, " ")
            .trim();
        return [
            genericListTopic || normalized,
            `${genericListTopic || normalized} latest`,
            `${genericListTopic || normalized} official`,
            `${genericListTopic || normalized} 2026`
        ];
    }

    const variants = new Set();
    variants.add(normalized);

    const topic = extractTopicText(normalized);
    if (topic && topic !== normalized) variants.add(topic);

    if (info.current && !/\bcurrent\b/i.test(normalized)) variants.add(`${topic} current`);
    if (info.news) {
        if (topic && !/^latest(?: 5)?$|^news$|^headlines$/i.test(topic)) variants.add(`${topic} latest news`);
        variants.add("latest news");
        variants.add("top news headlines today");
    }
    if (info.research) variants.add(`${topic} research`);
    if (info.code) variants.add(`${topic} documentation`);

    return [...variants].filter(item => item.length >= 2).slice(0, 4);
}

function freshnessFor(info) {
    if (info.news || info.current) return "pw";
    return null;
}

function sourcePlan(query) {
    const info = classifyQuery(query);
    const plan = new Set();

    // Keyless search is always available through independent public indexes.
    // Brave is optional for a higher-capacity dedicated web index.
    if (searxngClient.enabled()) plan.add("searxng");
    if (process.env.BRAVE_SEARCH_API_KEY) {
        plan.add("braveWeb");
        plan.add("braveContext");
    }
    plan.add("duckduckgo");
    if (SEARCH.browserFallbackEnabled) plan.add("browser");
    plan.add("wikimedia");

    if (info.news) {
        if (info.news && process.env.BRAVE_SEARCH_API_KEY) plan.add("braveNews");
        plan.add("googleNews");
        plan.add("newsRss");
        plan.add("hackerNews");
    }
    if (info.research) {
        plan.add("arxiv");
        plan.add("openalex");
        plan.add("crossref");
    }
    if (info.learning || info.code) plan.add("wikibooks");

    return [...plan];
}

function parseDdGHref(href) {
    const value = String(href || "");
    if (!value) return null;
    try {
        if (value.startsWith("//")) return canonicalUrl(`https:${value}`);
        const url = new URL(value, "https://html.duckduckgo.com");
        const target = url.searchParams.get("uddg");
        return canonicalUrl(target || url.toString());
    } catch { return null; }
}

function stripHtml(value) { return cleanText(value, 1_200); }

function searchDuckDuckGoHtml(query) {
    return axios.get("https://html.duckduckgo.com/html/", {
        params: { q: normalizeQuery(query), kl: "in-en", safe: "moderate" },
        timeout: SEARCH.timeoutMs,
        headers: { ...COMMON_HEADERS, Accept: "text/html,application/xhtml+xml" }
    }).then(response => {
        const html = String(response.data || "");
        const results = [];
        const pattern = /<a[^>]*class=["'][^"']*result__a[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        while ((match = pattern.exec(html)) && results.length < SEARCH.maxResultsPerSource) {
            const url = parseDdGHref(match[1]);
            const title = stripHtml(match[2]);
            const after = html.slice(match.index + match[0].length, match.index + match[0].length + 4_000);
            const snippetMatch = after.match(/class=["'][^"']*result__snippet[^"']*["'][^>]*>([\s\S]*?)<\/(?:a|div)>/i);
            const text = stripHtml(snippetMatch?.[1] || title);
            const item = result({ source: "Web Search", provider: "duckduckgo", type: "web", title, text, url });
            if (item) results.push(item);
        }
        return results;
    });
}

async function searchBraveWeb(query) {
    if (!process.env.BRAVE_SEARCH_API_KEY) return [];
    const params = {
        q: normalizeQuery(query),
        count: SEARCH.maxResultsPerSource,
        country: SEARCH.braveCountry,
        search_lang: SEARCH.braveLanguage,
        safesearch: "moderate",
        extra_snippets: true
    };
    const freshness = freshnessFor(classifyQuery(query));
    if (freshness) params.freshness = freshness;
    const response = await axios.get("https://api.search.brave.com/res/v1/web/search", {
        params,
        timeout: SEARCH.timeoutMs,
        headers: {
            Accept: "application/json",
            "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY,
            "User-Agent": USER_AGENT
        }
    });
    return (response.data?.web?.results || []).map(item => result({
        source: "Web Search",
        provider: "brave",
        type: "web",
        title: item.title,
        text: [item.description, ...(Array.isArray(item.extra_snippets) ? item.extra_snippets : [])].filter(Boolean).join(" "),
        url: item.url,
        publisher: hostname(item.url),
        publishedAt: item.page_age || item.page_fetched
    })).filter(Boolean);
}

async function searchBraveContext(query) {
    if (!process.env.BRAVE_SEARCH_API_KEY) return [];
    const response = await axios.get("https://api.search.brave.com/res/v1/llm/context", {
        params: {
            q: normalizeQuery(query),
            country: SEARCH.braveCountry,
            search_lang: SEARCH.braveLanguage,
            count: Math.min(SEARCH.maxResultsPerSource, 20),
            safesearch: "strict",
            spellcheck: true,
            maximum_number_of_urls: Math.min(20, SEARCH.maxFinalResults),
            maximum_number_of_tokens: 8192,
            context_threshold_mode: "strict",
            freshness: classifyQuery(query).news ? "pw" : undefined
        },
        timeout: Math.min(SEARCH.timeoutMs, 30_000),
        headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY,
            "User-Agent": USER_AGENT
        }
    });

    const payload = response.data || {};
    const chunks = [];
    const pushChunk = (item, fallbackText = "") => {
        const snippets = Array.isArray(item?.snippets) ? item.snippets.filter(Boolean) : [];
        const text = snippets.join(" ") || item?.text || item?.content || item?.snippet || item?.description || fallbackText;
        if (!text) return;
        const url = item?.url || item?.link || item?.source?.url;
        const title = item?.title || item?.name || item?.source?.title || url || "Web context";
        const normalized = result({
            source: "Web Context",
            provider: "brave-context",
            type: "web",
            title,
            text,
            url,
            publisher: item?.site_name || item?.source?.site_name || hostname(url),
            publishedAt: item?.age || item?.source?.age || null
        });
        if (normalized) chunks.push(normalized);
    };

    const generic = payload.grounding?.generic;
    if (Array.isArray(generic)) generic.forEach(item => pushChunk(item));
    if (Array.isArray(payload.results)) payload.results.forEach(item => pushChunk(item));
    if (Array.isArray(payload.web?.results)) payload.web.results.forEach(item => pushChunk(item));
    if (Array.isArray(payload.sources)) payload.sources.forEach(item => pushChunk(item));

    return chunks.slice(0, SEARCH.maxResultsPerSource);
}

async function searchBraveNews(query) {
    if (!process.env.BRAVE_SEARCH_API_KEY) return [];
    const response = await axios.get("https://api.search.brave.com/res/v1/news/search", {
        params: {
            q: normalizeQuery(query).slice(0, 400),
            count: Math.min(SEARCH.maxResultsPerSource, 20),
            country: SEARCH.braveCountry,
            search_lang: SEARCH.braveLanguage,
            safesearch: "strict",
            freshness: "pw",
            extra_snippets: true,
            spellcheck: true
        },
        timeout: Math.min(SEARCH.timeoutMs, 30_000),
        headers: { Accept: "application/json", "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY, "User-Agent": USER_AGENT }
    });
    return (response.data?.results || []).map(item => result({
        source: "News Search", provider: "brave-news", type: "news", title: item.title,
        text: [item.description, ...(Array.isArray(item.extra_snippets) ? item.extra_snippets : [])].filter(Boolean).join(" "),
        url: item.url, publisher: item.profile?.long_name || item.profile?.name || item.meta_url?.hostname || hostname(item.url),
        publishedAt: item.page_age || item.page_fetched || item.fetched_content_timestamp
            ? item.page_age || item.page_fetched || new Date(Number(item.fetched_content_timestamp)).toISOString()
            : null
    })).filter(Boolean);
}

const NEWS_RSS_FEEDS = [
    { provider: "bbc-news", publisher: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml" },
    { provider: "npr-news", publisher: "NPR", url: "https://feeds.npr.org/1001/rss.xml" },
    { provider: "guardian-news", publisher: "The Guardian", url: "https://www.theguardian.com/world/rss" }
];

async function searchNewsRss(query) {
    const terms = queryTerms(query);
    const feeds = await Promise.allSettled(NEWS_RSS_FEEDS.map(async feed => {
        const response = await axios.get(feed.url, {
            timeout: SEARCH.timeoutMs,
            headers: { ...COMMON_HEADERS, Accept: "application/rss+xml,application/xml,text/xml" }
        });
        const parsed = await parseStringPromise(response.data, { explicitArray: true, trim: true });
        const items = parsed?.rss?.channel?.[0]?.item || parsed?.feed?.entry || [];
        return items.map(item => {
            const title = item.title?.[0]?._ || item.title?.[0] || "";
            const description = item.description?.[0] || item.summary?.[0] || title;
            const link = item.link?.[0]?.href || item.link?.[0] || item.guid?.[0]?._ || item.guid?.[0] || null;
            const publishedAt = item.pubDate?.[0] || item.published?.[0] || item.updated?.[0] || null;
            const normalized = result({
                source: "News Search",
                provider: feed.provider,
                type: "news",
                title,
                text: description || title,
                url: typeof link === "string" ? link : null,
                publisher: feed.publisher,
                publishedAt
            });
            if (!normalized) return null;
            if (!terms.length) return normalized;
            const haystack = `${normalized.title} ${normalized.text}`.toLowerCase();
            const matches = terms.filter(term => haystack.includes(term)).length;
            return matches > 0 || /latest|today|recent|news|headlines/i.test(query) ? normalized : null;
        }).filter(Boolean);
    }));
    return feeds.flatMap(item => item.status === "fulfilled" ? item.value : []).slice(0, SEARCH.maxResultsPerSource * NEWS_RSS_FEEDS.length);
}

function normalizeGoogleNewsItem(item) {
    const source = item.source?.[0] || {};
    return result({
        source: "Google News RSS",
        provider: "google-news-rss",
        type: "news",
        title: item.title?.[0],
        text: item.description?.[0] || item.title?.[0],
        url: item.link?.[0],
        publisher: source._ || source,
        publishedAt: item.pubDate?.[0]
    });
}

async function searchGoogleNews(query) {
    const response = await axios.get("https://news.google.com/rss/search", {
        params: { q: normalizeQuery(query), hl: "en-IN", gl: "IN", ceid: "IN:en" },
        timeout: SEARCH.timeoutMs,
        headers: { ...COMMON_HEADERS, Accept: "application/rss+xml,application/xml,text/xml" }
    });
    const feed = await parseStringPromise(response.data, { explicitArray: true, trim: true });
    return (feed?.rss?.channel?.[0]?.item || []).map(normalizeGoogleNewsItem).filter(Boolean).slice(0, SEARCH.maxResultsPerSource);
}

function normalizeWikimediaPage(page) {
    return result({
        source: "Wikimedia",
        provider: "wikimedia",
        type: "reference",
        title: page.title,
        text: page.extract,
        url: page.fullurl || (page.pageid ? `https://en.wikipedia.org/?curid=${page.pageid}` : null),
        publisher: "Wikimedia",
        publishedAt: page.touched
    });
}

function searchTopic(query) {
    return normalizeQuery(query)
        .replace(/^(?:who\s+(?:is|was)|what\s+(?:is|are))\s+/i, "")
        .replace(/\b(?:current|latest|newest|today|news|recent)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

async function searchWikimedia(query) {
    const officeTitle = officeTitleFor(query);
    if (officeTitle) {
        const response = await axios.get("https://en.wikipedia.org/w/api.php", {
            params: {
                action: "query", format: "json", titles: officeTitle,
                prop: "extracts|info", exintro: true, explaintext: true, inprop: "url"
            },
            timeout: SEARCH.timeoutMs,
            headers: COMMON_HEADERS
        });
        const results = Object.values(response.data?.query?.pages || {})
            .map(normalizeWikimediaPage)
            .filter(Boolean);
        await Promise.all(results.map(enrichCurrentOfficeHolder));
        return results.slice(0, SEARCH.maxResultsPerSource);
    }

    const topic = searchTopic(query);
    const response = await axios.get("https://en.wikipedia.org/w/api.php", {
        params: {
            action: "query", format: "json", generator: "search", gsrsearch: normalizeQuery(query),
            gsrlimit: SEARCH.maxResultsPerSource, prop: "extracts|info", exintro: true, explaintext: true, inprop: "url"
        },
        timeout: SEARCH.timeoutMs,
        headers: COMMON_HEADERS
    });
    const results = Object.values(response.data?.query?.pages || {})
        .map(normalizeWikimediaPage)
        .filter(Boolean)
        .sort((a, b) => {
            const left = a.title.toLowerCase();
            const right = b.title.toLowerCase();
            const ls = left === topic ? 3 : left.includes(topic) ? 2 : 0;
            const rs = right === topic ? 3 : right.includes(topic) ? 2 : 0;
            return rs - ls;
        });
    return results.slice(0, SEARCH.maxResultsPerSource);
}

function officeTitleFor(query) {
    const text = normalizeQuery(query).toLowerCase();
    if (/\bchief minister\b/.test(text) && /\btamil nadu\b/.test(text)) return "Chief Minister of Tamil Nadu";
    if (/\bprime minister\b/.test(text) && /\bindia\b/.test(text)) return "Prime Minister of India";
    return null;
}

async function enrichCurrentOfficeHolder(item) {
    if (!/^(chief minister|prime minister|president|governor|mayor) of /i.test(item.title)) return item;
    try {
        const response = await axios.get("https://en.wikipedia.org/w/api.php", {
            params: { action: "parse", format: "json", page: item.title, prop: "wikitext" },
            timeout: SEARCH.timeoutMs,
            headers: COMMON_HEADERS
        });
        const wikitext = response.data?.parse?.wikitext?.["*"] || "";
        const match = wikitext.match(/\|\s*(?:incumbent|officeholder)\s*=\s*([^\n|]+)/i);
        const holder = cleanText(match?.[1], 160).replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, "$1").replace(/\[\[|\]\]/g, "");
        if (holder) {
            item.currentOfficeHolder = holder;
            item.text = cleanText(`${holder} is the current office holder for ${item.title}. ${item.text}`);
        }
    } catch {}
    return item;
}

async function searchArxiv(query) {
    const response = await axios.get("https://export.arxiv.org/api/query", {
        params: {
            search_query: `all:"${normalizeQuery(query).replace(/"/g, "")}"`,
            start: 0, max_results: SEARCH.maxResultsPerSource, sortBy: "submittedDate", sortOrder: "descending"
        },
        timeout: SEARCH.timeoutMs,
        headers: { ...COMMON_HEADERS, Accept: "application/atom+xml,application/xml" }
    });
    const feed = await parseStringPromise(response.data, { explicitArray: true, trim: true });
    return (feed?.feed?.entry || []).map(item => result({
        source: "Research Search", provider: "arxiv", type: "research", title: item.title?.[0], text: item.summary?.[0],
        url: item.id?.[0], publisher: "arXiv", publishedAt: item.published?.[0]
    })).filter(Boolean);
}

async function searchOpenAlex(query) {
    const response = await axios.get("https://api.openalex.org/works", {
        params: { search: normalizeQuery(query), per_page: SEARCH.maxResultsPerSource, sort: "publication_date:desc" },
        timeout: SEARCH.timeoutMs,
        headers: COMMON_HEADERS
    });
    return (response.data?.results || []).map(item => result({
        source: "Research Search", provider: "openalex", type: "research", title: item.title,
        text: item.abstract_inverted_index
            ? Object.entries(item.abstract_inverted_index)
                .flatMap(([word, positions]) => positions.map(position => [position, word]))
                .sort((a, b) => a[0] - b[0])
                .map(item => item[1]).join(" ")
            : `${item.title || ""}. ${item.primary_location?.source?.display_name || ""}.`,
        url: item.primary_location?.landing_page_url || item.doi || null,
        publisher: item.primary_location?.source?.display_name || "OpenAlex",
        publishedAt: item.publication_date
    })).filter(Boolean);
}

async function searchCrossref(query) {
    const response = await axios.get("https://api.crossref.org/works", {
        params: {
            query: normalizeQuery(query), rows: SEARCH.maxResultsPerSource,
            select: "title,author,published,URL,container-title,abstract"
        },
        timeout: SEARCH.timeoutMs,
        headers: { ...COMMON_HEADERS, "User-Agent": `${USER_AGENT}; mailto:research@invalid.example` }
    });
    return (response.data?.message?.items || []).map(item => result({
        source: "Research Search", provider: "crossref", type: "research", title: item.title?.[0],
        text: item.abstract || `${item.title?.[0] || ""} published in ${item["container-title"]?.[0] || "a scholarly venue"}.`,
        url: item.URL, publisher: item["container-title"]?.[0] || "Crossref",
        publishedAt: item.published?.["date-parts"]?.[0]?.join("-")
    })).filter(Boolean);
}

async function searchHackerNews(query) {
    const response = await axios.get("https://hn.algolia.com/api/v1/search", {
        params: { query: normalizeQuery(query), tags: "story", hitsPerPage: SEARCH.maxResultsPerSource },
        timeout: SEARCH.timeoutMs,
        headers: COMMON_HEADERS
    });
    return (response.data?.hits || []).map(item => result({
        source: "Community Search", provider: "hacker-news", type: "news", title: item.title,
        text: item.story_text || item.title, url: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
        publisher: "Hacker News", publishedAt: item.created_at
    })).filter(Boolean);
}

async function searchWikibooks(query) {
    const response = await axios.get("https://en.wikibooks.org/w/api.php", {
        params: {
            action: "query", format: "json", generator: "search", gsrsearch: normalizeQuery(query),
            gsrlimit: SEARCH.maxResultsPerSource, prop: "extracts|info", exintro: true, explaintext: true, inprop: "url"
        },
        timeout: SEARCH.timeoutMs,
        headers: COMMON_HEADERS
    });
    return Object.values(response.data?.query?.pages || {}).map(page => result({
        source: "Learning Search", provider: "wikibooks", type: "learning", title: page.title,
        text: page.extract, url: page.fullurl || null, publisher: "Wikibooks", publishedAt: page.touched
    })).filter(Boolean);
}

const handlers = {
    searxng: (query, options) => searxngClient.search(query, options),
    braveWeb: searchBraveWeb,
    braveContext: searchBraveContext,
    browser: browserSearch.search,
    braveNews: searchBraveNews,
    duckduckgo: searchDuckDuckGoHtml,
    googleNews: searchGoogleNews,
    newsRss: searchNewsRss,
    wikimedia: searchWikimedia,
    arxiv: searchArxiv,
    openalex: searchOpenAlex,
    crossref: searchCrossref,
    hackerNews: searchHackerNews,
    wikibooks: searchWikibooks
};

function authorityScore(item) {
    const host = hostname(item.url);
    let score = 0;
    for (const [pattern, bonus] of TRUSTED_DOMAIN_BONUS) if (pattern.test(host)) score = Math.max(score, bonus);
    if (item.provider === "brave-context") score += 2;
    if (item.provider === "browser") score += 1;
    if (item.type === "research") score += 2;
    return score;
}

function freshnessScore(item, info) {
    if (!item.publishedAt) return 0;
    const ageDays = Math.max(0, (Date.now() - Date.parse(item.publishedAt)) / 86_400_000);
    if (info.news || info.current) return clamp(8 - ageDays / 2, 0, 8);
    return clamp(3 - ageDays / 120, 0, 3);
}

function relevanceSignals(item, query) {
    const terms = queryTerms(query);
    if (!terms.length) return { terms: [], matched: 0, titleMatched: 0, bodyMatched: 0, coverage: 0, exactPhrase: false };
    const title = String(item.title || '').toLowerCase();
    const body = String(item.text || '').toLowerCase();
    const full = `${title} ${body}`;
    let matched = 0;
    let titleMatched = 0;
    let bodyMatched = 0;
    for (const term of terms) {
        if (title.includes(term)) { matched += 1; titleMatched += 1; }
        else if (body.includes(term)) { matched += 1; bodyMatched += 1; }
    }
    const normalizedQuery = normalizeQuery(query).toLowerCase();
    const compactQuery = normalizedQuery.replace(/^(?:what|who|where|when|why|how)\s+(?:is|are|was|were)\s+/i, '').trim();
    return {
        terms,
        matched,
        titleMatched,
        bodyMatched,
        coverage: matched / terms.length,
        exactPhrase: Boolean(normalizedQuery && (title.includes(normalizedQuery) || title.includes(compactQuery)))
    };
}

function relevanceScore(item, query) {
    const signals = relevanceSignals(item, query);
    if (!signals.terms.length) return 0;
    let score = signals.titleMatched * 5 + signals.bodyMatched * 2;
    score += signals.coverage * 8;
    if (signals.exactPhrase) score += 12;
    if (item.currentOfficeHolder) score += 8;
    return score;
}

function isResultRelevant(item, query, info = classifyQuery(query)) {
    const signals = relevanceSignals(item, query);
    if (!signals.terms.length) return false;
    if (signals.matched === 0) return false;

    const topic = extractTopicText(query).toLowerCase();
    const title = String(item.title || "").toLowerCase();
    const body = String(item.text || "").toLowerCase();
    const combined = `${title} ${body}`;
    const topicAliases = {
        gpu: /\b(?:gpu|graphics card|graphics processing unit|nvidia|amd|intel|geforce|radeon|arc|rtx|rx)\b/i,
        phone: /\b(?:phone|smartphone|mobile|iphone|galaxy|pixel|oneplus|xiaomi|redmi|motorola|vivo|oppo|realme)\b/i,
        phones: /\b(?:phone|smartphone|mobile|iphone|galaxy|pixel|oneplus|xiaomi|redmi|motorola|vivo|oppo|realme)\b/i,
        tablet: /\b(?:tablet|ipad|galaxy tab|xiaomi pad|redmi pad|oneplus pad|pixel tablet)\b/i,
        tablets: /\b(?:tablet|ipad|galaxy tab|xiaomi pad|redmi pad|oneplus pad|pixel tablet)\b/i,
        laptop: /\b(?:laptop|notebook|macbook|thinkpad|vivobook|ideapad|zenbook|rog|victus|legion)\b/i,
        laptops: /\b(?:laptop|notebook|macbook|thinkpad|vivobook|ideapad|zenbook|rog|victus|legion)\b/i,
        game: /\b(?:game|gaming|playstation|xbox|nintendo|steam|rockstar|resident evil|minecraft|fortnite)\b/i,
        games: /\b(?:game|gaming|playstation|xbox|nintendo|steam|rockstar|resident evil|minecraft|fortnite)\b/i,
        movie: /\b(?:movie|film|cinema|netflix|disney|marvel|dc)\b/i,
        movies: /\b(?:movie|film|cinema|netflix|disney|marvel|dc)\b/i
    };
    const aliasMatch = topicAliases[topic]?.test(combined);
    if (topic.length >= 3 && !title.includes(topic) && !body.includes(topic) && !aliasMatch && topic.split(/\s+/).filter(Boolean).length === 1) return false;

    // Every search gets the same entity/topic lock. Generic conversational words
    // are excluded from queryTerms, so unrelated pages no longer pass on words
    // like "do", "you", or "know".
    const termCount = signals.terms.length;
    const coverageRequired = termCount >= 5 ? 0.40 : termCount >= 3 ? 0.50 : termCount === 2 ? 0.50 : 1;
    const titleEscape = signals.titleMatched >= (termCount >= 4 ? 2 : 1);
    if (signals.coverage < coverageRequired && !titleEscape && !signals.exactPhrase) return false;

    // Intent-aware evidence requirements improve source discipline without making
    // the search GPU-specific.
    if (info.news && item.type !== 'news' && signals.titleMatched === 0 && signals.coverage < 0.67) return false;
    if (info.research && item.type !== 'research' && signals.titleMatched === 0 && signals.coverage < 0.67) return false;
    if (info.learning && item.type !== 'learning' && !/docs?|documentation|guide|tutorial|reference/i.test(String(item.title || '')) && signals.coverage < 0.67) return false;
    return true;
}

function scoreResult(item, query) {
    const info = classifyQuery(query);
    let score = relevanceScore(item, query) + authorityScore(item) + freshnessScore(item, info);
    if (info.news && item.type === "news") score += 5;
    if (info.research && item.type === "research") score += 5;
    if (info.learning && item.type === "learning") score += 4;
    if (info.current && item.currentOfficeHolder) score += 6;
    if (info.code && /(^|\.)github\.com$|docs\./i.test(hostname(item.url))) score += 4;
    if (/openai\.com|rockstargames\.com|nasa\.gov|microsoft\.com|apple\.com|google\.com|mozilla\.org/i.test(hostname(item.url))) score += 4;
    if (info.local && item.publisher) score += 1;
    if (info.currentList && info.gpu) {
        const title = String(item.title || "");
        const body = String(item.text || "");
        const gpuModel = /(?:GeForce\s+RTX\s+\d{4}(?:\s+(?:Ti|SUPER|Super))?|Radeon\s+(?:RX|AI\s+PRO)\s+[A-Z]?\d{3,5}(?:\s+(?:XT|GRE|XTX|PRO))?|Arc\s+[A-Z]?\d{3,4})/i.test(`${title} ${body}`);
        const vendor = /\b(nvidia|amd|intel|geforce|radeon|arc)\b/i.test(title);
        if (gpuModel) score += 14;
        else if (vendor) score += 5;
        if (/nvidia\.com|amd\.com|intel\.com/i.test(hostname(item.url))) score += 7;
        if (!gpuModel && !vendor) score -= 6;
    }
    return score;
}

function removeDuplicates(results) {
    const seen = new Set();
    const titleSeen = new Map();
    return results.filter(item => {
        const key = canonicalUrl(item.url) || `${item.title}|${item.publisher || ""}`.toLowerCase();
        if (seen.has(key)) return false;
        const titleKey = item.title.toLowerCase().replace(/\W+/g, " ").trim();
        const existing = titleSeen.get(titleKey);
        if (existing && existing.provider !== item.provider && Math.abs(existing.score - item.score) < 2) return false;
        seen.add(key);
        titleSeen.set(titleKey, item);
        return true;
    });
}

function diversify(results) {
    const perDomain = new Map();
    const perProvider = new Map();
    return results.filter(item => {
        const domain = hostname(item.url) || item.provider || "unknown";
        const domainCount = perDomain.get(domain) || 0;
        const providerCount = perProvider.get(item.provider) || 0;
        if (domainCount >= 4) return false;
        if (providerCount >= Math.ceil(SEARCH.maxFinalResults / 2)) return false;
        perDomain.set(domain, domainCount + 1);
        perProvider.set(item.provider, providerCount + 1);
        return true;
    });
}


function isPrivateIpv4(ip) {
    const parts = String(ip || "").split(".").map(Number);
    if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return false;
    const [a, b] = parts;
    return a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

function isPrivateIpv6(host) {
    const value = String(host || "").toLowerCase();
    return value === "::1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:");
}

async function isPublicUrl(value) {
    const normalized = canonicalUrl(value);
    if (!normalized) return false;
    try {
        const parsed = new URL(normalized);
        const host = parsed.hostname.toLowerCase();
        if (["localhost", "localhost.localdomain"].includes(host)) return false;
        if (isPrivateIpv4(host) || isPrivateIpv6(host)) return false;
        const dns = require("dns").promises;
        const addresses = await dns.lookup(host, { all: true, verbatim: true });
        if (!addresses.length) return false;
        return addresses.every(item => {
            const address = item.address;
            if (item.family === 4) return !isPrivateIpv4(address);
            if (item.family === 6) return !isPrivateIpv6(address);
            return false;
        });
    } catch {
        return false;
    }
}

function extractPageText(html) {
    let value = String(html || "");
    value = value.replace(/<!--[\s\S]*?-->/g, " ");
    value = value.replace(/<script[\s\S]*?<\/script>/gi, " ");
    value = value.replace(/<style[\s\S]*?<\/style>/gi, " ");
    value = value.replace(/<(?:nav|footer|aside|form|noscript|svg)[\s\S]*?<\/(?:nav|footer|aside|form|noscript|svg)>/gi, " ");
    const main = value.match(/<main\b[\s\S]*?<\/main>/i) || value.match(/<article\b[\s\S]*?<\/article>/i);
    value = main ? main[0] : value;
    return cleanText(value.replace(/<[^>]+>/g, " "), SEARCH.pageTextMaxLength);
}

function extractPageTitle(html, fallback) {
    const match = String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return cleanText(match?.[1] || fallback, 300) || fallback;
}

async function fetchPageEvidence(item) {
    if (!SEARCH.fetchPages || !item?.url || !/^https?:\/\//i.test(item.url)) return null;
    if (!(await isPublicUrl(item.url))) return null;
    try {
        let target = item.url;
        let response = null;
        for (let hop = 0; hop <= 4; hop += 1) {
            if (!(await isPublicUrl(target))) return null;
            response = await axios.get(target, {
                timeout: SEARCH.pageFetchTimeoutMs,
                maxContentLength: SEARCH.pageMaxBytes,
                maxBodyLength: SEARCH.pageMaxBytes,
                responseType: "text",
                maxRedirects: 0,
                validateStatus: status => status >= 200 && status < 400,
                headers: { ...COMMON_HEADERS, Accept: "text/html,application/xhtml+xml" }
            });
            if (response.status < 300) break;
            const location = response.headers?.location;
            if (!location || hop === 4) return null;
            target = new URL(location, target).toString();
        }
        const type = String(response?.headers?.["content-type"] || "").toLowerCase();
        if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) return null;
        const html = String(response.data || "");
        const text = extractPageText(html);
        if (!isUseful(text, "reference")) return null;
        return {
            title: extractPageTitle(html, item.title),
            text: text.slice(0, SEARCH.pageTextMaxLength),
            fetched: true
        };
    } catch (error) {
        console.log(`âš ï¸ Page fetch failed (${item.provider}):`, error.response?.status || error.code || error.message);
        return null;
    }
}

async function enrichWebPages(results) {
    if (!SEARCH.fetchPages) return results;
    const candidates = results
        .filter(item => item?.url && ["web", "reference"].includes(item.type) && ["duckduckgo", "brave", "browser"].includes(item.provider))
        .slice(0, SEARCH.pageFetchTopResults);
    if (!candidates.length) return results;
    const settled = await Promise.allSettled(candidates.map(fetchPageEvidence));
    const byUrl = new Map();
    candidates.forEach((item, index) => {
        const fetched = settled[index].status === "fulfilled" ? settled[index].value : null;
        if (fetched) byUrl.set(canonicalUrl(item.url), fetched);
    });
    return results.map(item => {
        const fetched = byUrl.get(canonicalUrl(item.url));
        if (!fetched) return item;
        const combined = cleanText(`${item.text}. ${fetched.text}`, 1600);
        return { ...item, title: fetched.title || item.title, text: combined, pageFetched: true };
    });
}

async function run(query, options = {}) {
    const names = sourcePlan(query);
    console.log(`ðŸ”Ž Prime web search: ${names.join(", ")}`);
    const variants = queryVariants(query);
    const jobs = [];

    const location = options?.location;
    const locationSuffix = location && Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
        ? ` near ${location.latitude.toFixed(3)},${location.longitude.toFixed(3)}`
        : "";

    const searchInfo = classifyQuery(query);

    for (const name of names) {
        const handler = handlers[name];
        if (!handler) continue;

        const sourceQueries =
            name === "googleNews" || name === "newsRss" || name === "braveContext"
                ? variants.slice(0, 3)
                : (
                    searchInfo.currentList &&
                    searchInfo.gpu &&
                    ["duckduckgo", "browser"].includes(name)
                )
                    ? variants.slice(0, 4)
                    : variants.slice(0, name === "duckduckgo" ? 2 : 1);
        for (const variant of sourceQueries) {
            const queryForSource = locationSuffix && ["duckduckgo", "browser", "braveWeb"].includes(name) ? `${variant}${locationSuffix}` : variant;
            jobs.push({ name, variant: queryForSource, handler });
        }
    }

    const settled = await Promise.allSettled(jobs.map(async job => {
        try {
            const values = await job.handler(job.variant);
            return Array.isArray(values) ? values : [];
        } catch (error) {
            console.log(`âš ï¸ Search source failed (${job.name}):`, error.response?.status || error.code || error.message);
            return [];
        }
    }));

    let results = settled.flatMap(item => item.status === "fulfilled" ? item.value : []).filter(Boolean);
    results = await enrichWebPages(results);
    const info = classifyQuery(query);
    let queryEmbedding = null;
    if (process.env.PRIME_EMBEDDING_URL || process.env.PRIME_ENABLE_OLLAMA_EMBEDDINGS === "true") {
        try { queryEmbedding = await semanticMemory.embed(query); } catch {}
    }
    results = hybridRetriever.fuse(query, results, queryEmbedding)
        .map(item => ({ ...item, score: scoreResult(item, query) + (item.hybridScore || 0), relevanceScore: relevanceScore(item, query) }))
        .filter(item => {
            if (!isResultRelevant(item, query, info)) return false;
            // List/current searches still get a stricter topic-family check, but the
            // rule is generic: it applies to any requested entity/category, not only GPUs.
            if (info.currentList) {
                const topicTerms = queryTerms(query).filter(term => !/^(latest|newest|current|recent|top|five|5|ten|10)$/.test(term));
                const haystack = `${item.title || ""} ${item.text || ""}`.toLowerCase();
                const topicHits = topicTerms.filter(term => haystack.includes(term)).length;
                if (topicTerms.length && topicHits === 0) return false;
            }
            return true;
        });
    results.sort((a, b) => b.score - a.score);
    results = diversify(removeDuplicates(results));
    if (bgeReranker.enabled()) {
        results = await bgeReranker.rerank(query, results.slice(0, Math.min(25, results.length)));
        results = results.map((item, index) => ({ ...item, score: (item.rerankScore || 0) * 100 + (item.score || 0) - index * 0.01 }));
    }

    const evidenceDomains = new Set(results.slice(0, 20).map(item => hostname(item.url)).filter(Boolean));
    if (evidenceDomains.size >= 3) results = results.map(item => ({ ...item, corroboration: Math.min(3, evidenceDomains.size) }));

    return results.slice(0, SEARCH.maxFinalResults);
}

async function search(query, options = {}) {
    const normalized = normalizeQuery(query);
    if (!normalized) return [];
    if (normalized.length > SEARCH.maxQueryLength) return [];

    const locationKey = options?.location && Number.isFinite(options.location.latitude) && Number.isFinite(options.location.longitude)
        ? `|${options.location.latitude.toFixed(3)},${options.location.longitude.toFixed(3)}`
        : "";
    const key = `${normalized.toLowerCase()}${locationKey}`;
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.results;
    if (inflight.has(key)) return inflight.get(key);

    const task = run(normalized, options)
        .then(results => {
            if (SEARCH.cacheTtlMs > 0) cache.set(key, { results, expiresAt: Date.now() + SEARCH.cacheTtlMs });
            while (cache.size > MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value);
            return results;
        })
        .finally(() => inflight.delete(key));

    inflight.set(key, task);
    return task;
}

function providerStatus() {
    return {
        searxng: searxngClient.enabled(),
        bgeReranker: bgeReranker.enabled(),
        embedding: Boolean(process.env.PRIME_EMBEDDING_URL) || process.env.PRIME_ENABLE_OLLAMA_EMBEDDINGS === "true",
        braveWeb: Boolean(process.env.BRAVE_SEARCH_API_KEY),
        braveContext: Boolean(process.env.BRAVE_SEARCH_API_KEY),
        duckduckgo: true,
        browser: browserSearch.available(),
        webFetch: Boolean(SEARCH.fetchPages),
        newsRss: true,
        googleNews: true,
        wikimedia: true,
        arxiv: true,
        openalex: true,
        crossref: true,
        hackerNews: true,
        wikibooks: true
    };
}

module.exports = {
    search,
    providerStatus,
    normalizeQuery,
    isNewsQuery,
    isCurrentOfficeQuery,
    normalizeGoogleNewsItem,
    searchNewsRss,
    normalizeWikimediaPage,
    officeTitleFor,
    sourcePlan,
    queryVariants,
    __test: { cleanText, canonicalUrl, classifyQuery, queryTerms, relevanceSignals, relevanceScore, isResultRelevant, scoreResult, removeDuplicates, diversify }
};
