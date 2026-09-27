// Prime Knowledge System Test

const knowledgeManager = require("./knowledgeManager");


console.log("\n🚀 Testing Prime Knowledge System\n");


const questions = [
    "What is artificial intelligence?",
    "What is a CPU?",
    "Explain gravity",
    "What is DNA?"
];


for (const question of questions) {

    console.log("--------------------------------");
    console.log("Question:", question);
    console.log("--------------------------------");


    const results = knowledgeManager.searchKnowledge(question);


    if (!results || results.length === 0) {

        console.log("No knowledge found\n");
        continue;

    }


    console.log("\nPrime Results:\n");


    results.slice(0,5).forEach((item,index)=>{

        const fact = item.fact || item;


        console.log(
            `${index + 1}. ${fact.answer}`
        );


        console.log(
            "Score:",
            item.score?.toFixed(3) || "N/A"
        );


        console.log(
            "ID:",
            fact.id
        );


        console.log("");

    });


}