/**
 * Local browser-backed web search fallback.
 * Uses an installed Chrome/Chromium/Edge executable in headless mode.
 * Disabled unless SEARCH_BROWSER_FALLBACK=true. Never required on Render.
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const USER_AGENT = "Prime/2.2 local browser search";

function executableCandidates() {
    if (process.platform === "win32") {
        const roots = [
            process.env.PROGRAMFILES,
            process.env["PROGRAMFILES(X86)"],
            process.env.LOCALAPPDATA
        ].filter(Boolean);
        const candidates = [];
        for (const root of roots) {
            candidates.push(
                path.join(root, "Google", "Chrome", "Application", "chrome.exe"),
                path.join(root, "Microsoft", "Edge", "Application", "msedge.exe"),
                path.join(root, "Chromium", "Application", "chrome.exe")
            );
        }
        return candidates;
    }
    return [
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/bin/microsoft-edge",
        "/usr/bin/microsoft-edge-stable"
    ];
}

function findExecutable() {
    const configured = String(process.env.SEARCH_BROWSER_PATH || "").trim();
    if (configured && fs.existsSync(configured)) return configured;
    return executableCandidates().find(fs.existsSync) || null;
}

function available() {
    return String(process.env.SEARCH_BROWSER_FALLBACK || "false").toLowerCase() === "true" && Boolean(findExecutable());
}

function cleanText(value) {
    return String(value || "")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function parseBing(html) {
    const results = [];
    const pattern = /<li[^>]*class=["'][^"']*b_algo[^"']*["'][\s\S]*?<\/li>/gi;
    const blocks = String(html || "").match(pattern) || [];
    for (const block of blocks) {
        const link = block.match(/<h2[\s\S]*?<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
        if (!link) continue;
        const snippet = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        const url = link[1];
        if (!/^https?:\/\//i.test(url)) continue;
        results.push({
            source: "Web Search",
            provider: "browser",
            type: "web",
            title: cleanText(link[2]),
            text: cleanText(snippet?.[1] || link[2]),
            url
        });
        if (results.length >= 8) break;
    }
    return results;
}

function buildSearchUrl(query) {
    const url = new URL("https://www.bing.com/search");
    url.searchParams.set("q", query);
    url.searchParams.set("setlang", "en-IN");
    url.searchParams.set("cc", "IN");
    url.searchParams.set("form", "QBLH");
    return url.toString();
}

function runBrowser(url) {
    const executable = findExecutable();
    if (!executable || !available()) return Promise.resolve("");
    return new Promise((resolve, reject) => {
        const args = [
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--hide-scrollbars",
            "--user-agent=" + USER_AGENT,
            "--dump-dom",
            url
        ];
        const child = spawn(executable, args, { windowsHide: true });
        let stdout = "";
        let stderr = "";
        const timer = setTimeout(() => {
            child.kill();
            reject(new Error("Browser search timed out."));
        }, 15_000);
        child.stdout.on("data", chunk => { stdout += chunk; if (stdout.length > 2_000_000) child.kill(); });
        child.stderr.on("data", chunk => { stderr += chunk; });
        child.on("error", error => { clearTimeout(timer); reject(error); });
        child.on("close", code => {
            clearTimeout(timer);
            if (code === 0 || stdout) resolve(stdout);
            else reject(new Error(stderr.trim() || `Browser exited with ${code}`));
        });
    });
}

async function search(query) {
    try {
        if (!available()) return [];
        const html = await runBrowser(buildSearchUrl(String(query || "").trim()));
        return parseBing(html);
    } catch (error) {
        console.log("⚠️ Local browser search unavailable:", error.message);
        return [];
    }
}

module.exports = { search, available, findExecutable, parseBing };
