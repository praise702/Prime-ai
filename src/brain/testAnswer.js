const knowledgeManager = require("../knowledge/knowledgeManager");
const answerGenerator = require("./answerGenerator");


const question = "Explain gravity";


const results =
knowledgeManager.searchKnowledge(question);



const response =
answerGenerator.generateAnswer(
    results,
    question
);



console.log("\nPrime:");
console.log(response.answer);

console.log(
    "\nConfidence:",
    response.confidence + "%"
);