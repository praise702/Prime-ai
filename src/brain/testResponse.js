const knowledgeManager = require("../knowledge/knowledgeManager");
const responseGenerator = require("./responseGenerator");


const question = "Explain gravity";


const results =
knowledgeManager.searchKnowledge(question);



const answer =
responseGenerator.generateAnswer(
    results,
    question
);



console.log("\nPrime:\n");
console.log(answer);