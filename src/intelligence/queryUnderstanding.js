// Terms that are commonly treated as misspellings even though they are valid
// names, acronyms, products, programming terms, or model/platform names.
const PROTECTED_TERMS = new Set([
    "prime", "praise", "immanuel", "gta", "nvidia", "amd", "intel", "xiaomi", "redmi",
    "openai", "chatgpt", "claude", "gemini", "javascript", "typescript", "nodejs", "node",
    "python", "tensorflow", "pytorch", "github", "wikipedia", "wikimedia", "tamil", "nadu",
    "india", "einstein", "iphone", "ipad", "gpu", "cpu", "ram", "ssd", "api", "url", "html",
    "css", "js", "ai", "ml", "cm", "pm", "mla", "mp", "ceo", "cto", "firebase", "ollama",
    "llm", "json", "sql", "react", "unity", "roblox", "minecraft", "fortnite", "playstation",
    "xbox", "ps5", "ps6", "rdna", "zen", "directx", "opengl", "vulkan", "webgl", "webgpu",
    "bing", "duckduckgo", "google", "youtube", "github", "npm", "css", "xml", "pdf", "csv",
    "wifi", "wi-fi", "usb", "ssd", "hdd", "nvme", "dlss", "fsr", "xess", "raytracing"
]);

const COMMON_CORRECTIONS = Object.freeze({
    adn: "and", adress: "address", alot: "a lot", becuase: "because", begining: "beginning",
    cheif: "chief", definately: "definitely", developd: "developed", devoloped: "developed",
    enviroment: "environment", goverment: "government", hte: "the", helllo: "hello", helo: "hello",
    isnt: "is not", wasnt: "was not", werent: "were not", cant: "cannot", wont: "will not",
    didnt: "did not", doesnt: "does not", dont: "do not", didnt: "did not", nite: "night",
    occured: "occurred", pleasse: "please", recieve: "receive", seperate: "separate", teh: "the",
    tommorow: "tomorrow", untill: "until", whre: "where", wich: "which", wierd: "weird",
    whatt: "what", einsteinn: "einstein", einstin: "einstein", einsteen: "einstein", devolop: "develop", developement: "development",
    calcuate: "calculate", explan: "explain", exmple: "example", becuase: "because", thier: "their",
    recieve: "receive", ocured: "occurred", knowlege: "knowledge", queston: "question",
    mesage: "message", langauge: "language", intellgence: "intelligence", responce: "response",
    informaton: "information", reasearch: "research", latestt: "latest", curent: "current",
    newst: "newest", suport: "support", perfomance: "performance", performace: "performance"
});

const PHRASE_CORRECTIONS = Object.freeze({
    "okb ro": "ok bro",
    "okay bro": "ok bro",
    "ok bro": "ok bro"
});

const CONTRACTIONS = [
    [/\bwho['â€™]s\b/gi, "who is"], [ /\bwhat['â€™]s\b/gi, "what is"], [ /\bwhere['â€™]s\b/gi, "where is"],
    [/\bwhen['â€™]s\b/gi, "when is"], [ /\bthat['â€™]s\b/gi, "that is"], [ /\bthere['â€™]s\b/gi, "there is"],
    [/\bI['â€™]m\b/g, "I am"], [ /\bcan['â€™]t\b/gi, "cannot"], [ /\bwon['â€™]t\b/gi, "will not"],
    [/\bdon['â€™]t\b/gi, "do not"], [ /\bdoesn['â€™]t\b/gi, "does not"], [ /\bdidn['â€™]t\b/gi, "did not"],
    [/\bI['â€™]ve\b/g, "I have"], [ /\bI['â€™]ll\b/g, "I will"], [ /\bwouldn['â€™]t\b/gi, "would not"],
    [/\bcouldn['â€™]t\b/gi, "could not"], [ /\bshouldn['â€™]t\b/gi, "should not"], [ /\bisn['â€™]t\b/gi, "is not"],
    [/\bwasn['â€™]t\b/gi, "was not"], [ /\baren['â€™]t\b/gi, "are not"], [ /\bweren['â€™]t\b/gi, "were not"]
];

function cleanSurface(query) {
    let text = String(query || "").normalize("NFKC").replace(/[\u2018\u2019]/g, "'");
    for (const [bad, good] of Object.entries(PHRASE_CORRECTIONS)) {
        const pattern = new RegExp(`\\b${bad.split(/\s+/).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+")}\\b`, "gi");
        text = text.replace(pattern, good);
    }
    for (const [pattern, replacement] of CONTRACTIONS) text = text.replace(pattern, replacement);
    return text
        .replace(/[â€œâ€]/g, '"')
        .replace(/[!?]{3,}/g, "??")
        .replace(/\s+/g, " ")
        .trim();
}

function looksLikeEntity(token) {
    if (!token) return false;
    if (/\d/.test(token)) return true;
    if (/^https?:\/\//i.test(token) || /^www\./i.test(token)) return true;
    if (/^[A-Z]{2,}$/.test(token)) return true;
    if (/^[A-Za-z]+(?:[-_][A-Za-z0-9]+)+$/.test(token)) return true;
    if (/^[A-Za-z]+\d+[A-Za-z0-9-]*$/.test(token)) return true;
    return false;
}

function hasIntentContext(sentence) {
    return /\b(who|what|where|when|why|how|is|are|current|latest|news|tell|about|of|the|code|write|fix|explain|calculate|meaning|define|compare)\b/i.test(sentence);
}

function safeCorrection(token, index, sentence) {
    const lower = token.toLowerCase();

    if (!token || PROTECTED_TERMS.has(lower) || looksLikeEntity(token)) {
        return token;
    }

    if (COMMON_CORRECTIONS[lower]) {
        return preserveCase(COMMON_CORRECTIONS[lower], token);
    }

    if (lower.length < 3 || !hasIntentContext(sentence)) {
        return token;
    }

    if (index > 0 && /^[A-Z][a-z]+$/.test(token)) {
        return token;
    }

    // Keep typo handling lightweight for small cloud instances.
    // Do not load a massive English-word corpus or build a global spellchecker.
    const compressed = lower.replace(/(.)\1{2,}/g, "$1$1");

    if (compressed !== lower && COMMON_CORRECTIONS[compressed]) {
        return preserveCase(COMMON_CORRECTIONS[compressed], token);
    }

    return token;
}
function preserveCase(value, original) {
    if (!value) return value;
    if (/^[A-Z]+$/.test(original)) return value.toUpperCase();
    if (/^[A-Z]/.test(original)) return value.charAt(0).toUpperCase() + value.slice(1);
    return value;
}

function correctTypos(text) {
    let source = String(text || "");
    for (const [bad, good] of Object.entries(PHRASE_CORRECTIONS)) {
        const pattern = new RegExp(`\\b${bad.split(/\s+/).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+")}\\b`, "gi");
        source = source.replace(pattern, good);
    }
    return source.replace(/[A-Za-z][A-Za-z0-9'_-]*/g, (token, offset) => {
        const before = source.slice(0, offset);
        const index = (before.match(/\b/g) || []).length;
        return safeCorrection(token, index, source);
    });
}

function expandAbbreviations(text) {
    const input = String(text || "").replace(/\s+/g, " ").trim();
    const officeContext = /\b(current|present|chief|minister|tamil|india|state|government|who|office)\b/i.test(input);
    const definitionContext = /\b(?:what does|what is|meaning of|define)\b/i.test(input) &&
        !/\b(?:latest|newest|current|recent)\b/i.test(input);

    let result = input;
    if (officeContext) {
        result = result.replace(/\bcm\b/gi, "chief minister");
        result = result.replace(/\bpm\b/gi, "prime minister");
    }
    // Common entity aliases improve search matching without changing user-visible intent.
    result = result.replace(/\bgta\s*(?:5|v)\b/gi, "Grand Theft Auto V");
    result = result.replace(/\bgta\s+online\b/gi, "Grand Theft Auto Online");

    if (definitionContext) {
        result = result.replace(/\bai\b/gi, "artificial intelligence");
        result = result.replace(/\bml\b/gi, "machine learning");
        result = result.replace(/\bgpu\b/gi, "graphics processing unit");
        result = result.replace(/\bcpu\b/gi, "central processing unit");
        result = result.replace(/\bram\b/gi, "random access memory");
        result = result.replace(/\bssd\b/gi, "solid state drive");
    }
    return result.replace(/\s+/g, " ").trim();
}

function classify(normalizedQuery) {
    const q = String(normalizedQuery || "").toLowerCase().replace(/[?!.]/g, " ").replace(/\s+/g, " ").trim();

    const personal = /\b(my name|who am i|about me|remember me|remember about me|do you remember me|did i tell you|did i say earlier|what (?:\w+ )?do i (?:like|love|enjoy)|who (?:do|will) i love|who i love|what is my|what's my|favorite|favourite|preferences|interests|hobbies|important to me|call me|address me as|what should you call me|what do you call me|how should you address me|from now on|from now call me)\b/;
    if (personal.test(q)) return "USER_MEMORY";

    if (/\b(who (?:developed|created|made|built|designed) (?:you|prime)|who is behind you|who is your developer|what (?:are|is) (?:you|prime)|tell me about yourself|what can you do|what are your capabilities|your capabilities|what (?:model|powers) you|how (?:were|was) you (?:built|made))\b/.test(q)) return "PRIME_IDENTITY";

    if (/^\s*(?:hi|hello|hey|hai|hii|yo|good morning|good afternoon|good evening)\b/i.test(q)) return "GREETING";
    if (/\b(thank you|thanks|thx|tysm|appreciate it)\b/i.test(q)) return "THANKS";
    if (/^(?:i(?:'m| am)\s+)?(?:sad|down|upset|hurt|lonely|alone|stressed|overwhelmed|angry|mad|frustrated|annoyed|worried|scared|afraid|nervous|anxious|tired|sleepy|bored|happy|excited|proud)\b/i.test(q) || /^(?:i(?:'m| am)\s+)?(?:not okay|not ok|having a bad day|having a rough day)\b/i.test(q)) return "EMOTIONAL_SUPPORT";
    if (/^\s*(?:bye|goodbye|see you|see ya)\b/i.test(q)) return "FAREWELL";

    if (/\d/.test(q) && /(?:[+*/=-]|\b(?:calculate|multiply|divide|plus|minus|times|percent|percentage|square|cube|root|modulo)\b)/.test(q)) return "MATH";
    if (/\b(?:create|make|generate|draw|design|illustrate|render|paint)\b/.test(q) && /\b(?:image|picture|photo|drawing|illustration|artwork|wallpaper|avatar|logo|character|portrait)\b/.test(q)) return "IMAGE";
    if (/^(?:create|make|generate|draw|design|illustrate|render)\s+(?:me\s+)?(?:an?\s+)?(?!code\b|function\b|class\b).+/i.test(q)) return "IMAGE";

    if (/\b(?:write|implement|code|coding|debug|refactor|function|class|javascript|python|html|css|sql|node|react|unity|typescript|api docs|sdk)\b/.test(q)) return "CODE";
    if (/\b(?:summarize|summary|shorten|rewrite|rephrase|proofread|grammar|translate|translation|paraphrase)\b/.test(q)) return "WRITING";
    if (/\b(?:compare|difference|versus|vs\.?|pros and cons|advantages and disadvantages)\b/.test(q)) return "COMPARISON";
    if (/\b(?:plan|roadmap|schedule|step by step|steps to|how do i|how can i)\b/.test(q)) return "PLANNING";

    const office = /\b(chief minister|prime minister|president|governor|mayor)\b/;
    if (office.test(q) && /\b(current|present|now|today)\b/.test(q)) return "CURRENT_OFFICE_HOLDER";
    if (/\b(news|headlines|breaking|top stories)\b/.test(q) || (/\b(latest|today|recent)\b/i.test(q) && /\b(update|happened|events|stories)\b/.test(q))) return "NEWS";
    if (/^(?:i\s+mean\s+by|i\s+meant\s+by)\s+(?:new|newest|recent|latest)$/i.test(q)) return "NEWS";
    const latestList = /\b(latest|newest|current|recent|top)\b/.test(q) && /\b(?:5|five|10|ten)\b/.test(q);
    const gpu = /\b(?:gpu|gpus|graphics card|graphics cards|geforce|radeon|arc gpu)\b/.test(q);
    if (gpu && (latestList || /\b(?:latest|newest|current)\b/.test(q))) return "LATEST_GPU";
    if (latestList) return "LATEST_LIST";
    if (/\b(latest|newest|current|recently released|new release|generation|version|price today|available now)\b/.test(q)) return "CURRENT_FACT";

    return "NORMAL_KNOWLEDGE";
}

function isFreshRequest(query) {
    const q = String(query || "").toLowerCase();
    return /\b(latest|newest|current|today|now|recent|this week|breaking|news|2026|released|available now|price today)\b/.test(q);
}

function understandQuery(originalQuery) {
    const original = String(originalQuery || "");
    const surface = cleanSurface(original);
    const corrected = correctTypos(surface);
    const normalizedQuery = expandAbbreviations(corrected);
    const intent = classify(normalizedQuery);
    return {
        originalQuery: original,
        correctedQuery: corrected,
        normalizedQuery,
        intent,
        correctionApplied: corrected !== surface,
        needsFreshEvidence: isFreshRequest(normalizedQuery)
    };
}

module.exports = {
    understandQuery,
    classify,
    cleanSurface,
    correctTypos,
    expandAbbreviations,
    isFreshRequest
};
