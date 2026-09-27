const imageConfig = require("./imageConfig");

const defaultNegativePrompt = "blurry, low resolution, corrupted image, distorted anatomy, watermark, text artifacts";

function contains(prompt, words) {
    const text = prompt.toLowerCase();
    return words.some(word => text.includes(word));
}

function choose(prompt, choices, fallback) {
    return choices.find(choice => contains(prompt, choice.words))?.value || fallback;
}

function subjectFrom(prompt) {
    return prompt
        .replace(/^(please\s+)?(make|create|generate|draw|design|render|show\s+me)\s+(me\s+)?/i, "")
        .replace(/\b(an?\s+)?(image|picture|photo|artwork|illustration)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim() || "creative scene";
}

function requestedSeed(prompt, fallback) {
    const match = String(prompt).match(/\bseed\s*[:=]?\s*(\d+)\b/i);
    if (match) return Number.parseInt(match[1], 10);
    return Number.isInteger(fallback) ? fallback : null;
}

function dimensions(prompt, settings = {}) {
    const isPortrait = contains(prompt, ["portrait", "poster", "vertical"]);
    const isLandscape = contains(prompt, ["landscape", "wide", "cinematic"]);
    const width = Math.min(Number(settings.width) || (isPortrait ? 512 : 512), imageConfig.maxWidth);
    const height = Math.min(Number(settings.height) || (isLandscape ? 512 : 512), imageConfig.maxHeight);
    return { width: Math.max(256, width), height: Math.max(256, height) };
}

function createGenerationPlan({ originalPrompt, correctedPrompt, settings = {} }) {
    const prompt = String(originalPrompt || correctedPrompt || "").trim();
    const visionPrompt = String(correctedPrompt || originalPrompt || "").replace(/\s+/g, " ").trim();
    const subject = subjectFrom(prompt);
    const style = choose(prompt, [
        { words: ["minecraft"], value: "block-style game art" },
        { words: ["anime"], value: "anime illustration" },
        { words: ["cartoon"], value: "cartoon illustration" },
        { words: ["3d", "render"], value: "3D render" },
        { words: ["painting"], value: "digital painting" },
        { words: ["realistic", "photo", "photograph"], value: "photorealistic" }
    ], "cinematic illustration");
    const environment = choose(prompt, [
        { words: ["city", "cyberpunk"], value: "futuristic city" },
        { words: ["house", "home"], value: "architectural setting" },
        { words: ["robot"], value: "advanced laboratory" },
        { words: ["space", "planet"], value: "deep space" }
    ], "contextual environment");
    const lighting = choose(prompt, [
        { words: ["night", "dark"], value: "dramatic low-key lighting" },
        { words: ["sunset", "golden hour"], value: "warm sunset lighting" },
        { words: ["studio"], value: "soft studio lighting" }
    ], "cinematic lighting");
    const { width, height } = dimensions(prompt, settings);
    const details = contains(prompt, ["detailed", "high detail", "8k", "high resolution"])
        ? "high detail"
        : "balanced detail";

    return {
        subject,
        environment,
        style,
        mood: choose(prompt, [
            { words: ["dark", "horror"], value: "mysterious" },
            { words: ["happy", "cute"], value: "cheerful" },
            { words: ["futuristic", "cyberpunk"], value: "futuristic" }
        ], "immersive"),
        lighting,
        camera: choose(prompt, [
            { words: ["close-up", "portrait"], value: "close-up composition" },
            { words: ["aerial", "drone"], value: "aerial composition" },
            { words: ["wide", "landscape"], value: "wide composition" }
        ], "balanced composition"),
        composition: "subject-focused",
        materials: "appropriate to the subject",
        colors: contains(prompt, ["red"]) ? "red accent" : "natural palette",
        details,
        outputType: "image",
        negativePrompt: String(settings.negativePrompt || defaultNegativePrompt).trim(),
        positivePrompt: [visionPrompt, subject, environment, style, lighting, details]
            .filter(Boolean)
            .join(", ")
            .slice(0, 12_000),
        seed: requestedSeed(prompt, settings.seed),
        width,
        height,
        steps: Math.min(Math.max(Number(settings.steps) || 28, 1), 100),
        guidance: Math.min(Math.max(Number(settings.guidance) || 7, 1), 20),
        referenceImages: Array.isArray(settings.referenceImages) ? settings.referenceImages : []
    };
}

module.exports = { createGenerationPlan };
