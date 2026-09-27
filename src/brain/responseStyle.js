/* Final presentation layer: it formats responses without changing routing. */
function stripHiddenSourceAppendix(text) {
    return String(text || "")
        .replace(/\n+[-]{3,}\n+###\s*(?:📚\s*)?Sources[\s\S]*$/i, "")
        .replace(/\n+###\s*(?:📚\s*)?Sources[\s\S]*$/i, "")
        .replace(/\n+\*\*Sources\*\*[\s\S]*$/i, "")
        .replace(/\n+Sources:\s*[\s\S]*$/i, "")
        .trim();
}
function sentences(text) { return stripHiddenSourceAppendix(text).replace(/^#.+\n+/m, "").replace(/^(Here is a simple explanation:|The answer is:)\s*/i, "").replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []; }
function isComplexQuestion(message) { return /\b(explain|why|how|compare|difference|steps?|examples?|pros and cons)\b/i.test(message); }
function sanitizeAssistantOutput(answer) {
    let text = String(answer || "");
    text = text
        .replace(/\\([#*_`])/g, "$1")
        .replace(/\\\[/g, "[")
        .replace(/\\\]/g, "]")
        .replace(/^(?:Here are (?:five|5) current GPU models I found:\s*)?(?:1\.\s+[^\n]+)(?:\n|$)/i, match => match)
        .replace(/\n{4,}/g, "\n\n")
        .trim();
    // Hide accidental provider/source appendices from model or scraped text.
    text = stripHiddenSourceAppendix(text);
    return text;
}

function formatKnowledgeAnswer(answer, message) {
    answer = sanitizeAssistantOutput(answer);
    if (/^### Latest news\b/i.test(String(answer || ""))) return String(answer).trim();
    if (/\bcurrent office holder\b[\s\S]*\bSource:/i.test(String(answer || ""))) return String(answer).trim();
    const parts = sentences(answer).map(part => part.trim()).filter(Boolean);
    if (!parts.length) return createHonestFallback(message);
    if (!isComplexQuestion(message)) return parts.slice(0, 2).join(" ");
    const mainAnswer = parts.shift(), points = parts.slice(0, 4);
    if (!points.length) return `### Main answer\n\n${mainAnswer}`;
    return ["### Main answer", "", mainAnswer, "", "**Key points**", "", ...points.map(point => `- ${point}`)].join("\n");
}
function getReliableResponse(message) {
    const text = String(message || "").trim().toLowerCase();
    if (/^(what is|define)\s+python\??$/.test(text)) return "Python is a programming language used for automation, web development, data analysis, and AI. Its readable syntax makes it a popular place to start programming.";
    if (/^(explain|what are|what is)\s+(a\s+)?variables?\??$/.test(text)) return "### Main answer\n\nA variable is a named place to store a value so a program can use it later. For example, `score = 10` stores the number `10` in `score`.";
    if (/\b(why|how).*(my|the).*(image).*(fail|failed|error)|\bimage.*(fail|failed|error)/i.test(text)) return "An image is ready only when a provider returns an actual image URL. A request can fail because the provider has insufficient credits, its API key is missing, or it cannot be reached. The error shown after the request identifies the cause.";
    return null;
}
function createHonestFallback(message) { return /\?\s*$/.test(String(message || "")) ? "I don't have enough reliable information to answer that confidently, so I don't want to guess. Try adding a little more context and I’ll help where I can." : "I don't have enough reliable information about that yet, so I don't want to make something up."; }
function formatMemoryConfirmation(message) { return String(message || "").replace(/^I will remember that /i, "Got it — I'll remember that ").replace(/^Nice to meet you /i, "Nice to meet you, "); }
function formatMemoryContext(context) { const text=String(context||"").trim(), liked=text.match(/^likes:\s*(.+)\.?$/i), loved=text.match(/^You love\s+(.+)\.?$/i); if(liked) return `You told me that you like ${liked[1].replace(/\.$/,"")}.`; if(loved) return `You told me that you love ${loved[1].replace(/\.$/,"")}.`; const name=text.match(/^Your name is\s+(.+)\.?$/i); if(name) return `Your name is ${name[1].replace(/\.$/,"")}.`; return ["Here’s what I remember:","",...text.split("\n").filter(Boolean).map(item=>`- ${item}`)].join("\n"); }
module.exports={createHonestFallback,formatKnowledgeAnswer,formatMemoryConfirmation,formatMemoryContext,getReliableResponse,sanitizeAssistantOutput};
