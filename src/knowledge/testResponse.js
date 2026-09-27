const knowledgeManager = require("./knowledgeManager");
const responseGenerator = require("./responseGenerator");


const question = "Explain gravity";


console.log("\n🚀 Prime RESPONSE TEST\n");


const results =
    knowledgeManager.searchKnowledge(question);

const composer = require("./answerComposer");


const facts = results.map(item => item.fact);


const composed =
composer.composeAnswer(
    facts,
    question
);


console.log("\nCOMPOSED ANSWER FACTS:\n");

console.log(composed);

const response =
    responseGenerator.generateResponse(
        results,
        question
    );



console.log(response);