async function generate(message, context="") {

    return `
Prime:

I understand your question:
${message}

I am a custom AI system built with knowledge, reasoning, memory, and tools.
`;

}


module.exports = {
    generate
};