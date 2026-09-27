/* Prime identity and project-owner knowledge. */
function search(message) {
    const text = String(message || "").toLowerCase().replace(/[!?.,]+$/g, "").trim();
    if (
        text.includes("who created you") ||
        text.includes("who developed you") ||
        text.includes("who made you") ||
        text.includes("who developed prime") ||
        text.includes("who created prime") ||
        text.includes("who made prime") ||
        text.includes("who built prime") ||
        text.includes("what is prime")
    ) {
        return `I am Prime 🤖

I was created by Praise Immanuel.

I am an independent AI project designed to understand questions, use knowledge, solve problems, work with files, remember useful information, and assist with creative and technical tasks.`;
    }

    if (text.includes("what are you doing") || text === "what are you" || text.includes("what can you do")) {
        return `I am Prime 🤖

I can understand conversations, solve calculations, use my local and web knowledge systems, work with files, remember useful user information, help with coding and writing, and handle supported image and voice features.`;
    }

    if (text.includes("why are you repeating") || text.includes("why same answer")) {
        return `I am improving my conversation and context handling so I can use previous messages more accurately and avoid repeating the same answer.`;
    }

    return null;
}
module.exports = { search };
