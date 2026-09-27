const DB_NAME = "prime-browser-cache";
const DB_VERSION = 1;
const STORE = "searches";
const PREF_KEY = "prime-search-preferences";
const DEFAULT_TTL = 60_000;

function normalizeQuery(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function cacheKey(query, location) {
    const loc = location && Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
        ? `|${Number(location.latitude).toFixed(3)},${Number(location.longitude).toFixed(3)}`
        : "";
    return normalizeQuery(query) + loc;
}

function openDb() {
    return new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) return resolve(null);
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "key" });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
    });
}

async function getCachedSearch(query, location) {
    const db = await openDb();
    if (!db) return null;
    return new Promise(resolve => {
        const request = db.transaction(STORE, "readonly").objectStore(STORE).get(cacheKey(query, location));
        request.onsuccess = () => {
            const value = request.result;
            resolve(value && Date.now() - value.savedAt < DEFAULT_TTL ? value : null);
        };
        request.onerror = () => resolve(null);
    });
}

async function cacheSearch(query, results, location) {
    if (!Array.isArray(results) || !results.length) return;
    const db = await openDb();
    if (!db) return;
    await new Promise(resolve => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put({
            key: cacheKey(query, location),
            query: String(query),
            results: results.slice(0, 12),
            savedAt: Date.now()
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
    });
}

function loadPreferences() {
    try { return JSON.parse(localStorage.getItem(PREF_KEY) || "{}"); } catch { return {}; }
}

function savePreferences(patch) {
    try {
        const next = { ...loadPreferences(), ...patch };
        localStorage.setItem(PREF_KEY, JSON.stringify(next));
        return next;
    } catch { return loadPreferences(); }
}

function isLocalQuery(query) {
    return /\b(near me|nearby|in my area|close to me|around me|nearest|local)\b/i.test(String(query || ""));
}

function getLocationForQuery(query) {
    if (!isLocalQuery(query) || !("geolocation" in navigator)) return Promise.resolve(null);
    return new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(
            position => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            }),
            () => resolve(null),
            { enableHighAccuracy: false, maximumAge: 120_000, timeout: 5_000 }
        );
    });
}

function supportsSearchApis() {
    return {
        fetch: typeof window.fetch === "function",
        indexedDB: "indexedDB" in window,
        speechRecognition: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
        speechSynthesis: "speechSynthesis" in window,
        geolocation: "geolocation" in navigator,
        canvas: Boolean(document.createElement("canvas").getContext),
        webgl: (() => {
            try {
                const canvas = document.createElement("canvas");
                return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
            } catch { return false; }
        })()
    };
}

export {
    cacheSearch,
    getCachedSearch,
    getLocationForQuery,
    isLocalQuery,
    loadPreferences,
    savePreferences,
    supportsSearchApis
};
