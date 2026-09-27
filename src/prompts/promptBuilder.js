const systemPrompt = require("./systemPrompt");


function buildPrompt(message, memory = "") {

    return `
${systemPrompt}

User Memory:
${memory}

User Message:
${message}

Prime Response:
`;

}


module.exports = {
    buildPrompt
};