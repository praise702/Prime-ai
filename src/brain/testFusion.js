// 🚀 Prime Knowledge Fusion Test


const { fuseKnowledge } = require("./knowledgeFusion");


console.log("\n🚀 Prime KNOWLEDGE FUSION TEST\n");


// Prime internal knowledge

const primeFacts = [

    {
        fact: "Gravity is a force between masses.",
        topic: "physics",
        importance: 5
    },

    {
        fact: "Gravity keeps planets in orbit.",
        topic: "astronomy",
        importance: 5
    }

];


// Wikipedia / Web knowledge simulation

const webFacts = [

    {
        fact: "Albert Einstein developed the theory of relativity.",
        source: "wikipedia",
        importance: 5
    },

    {
        fact: "Einstein won the Nobel Prize in Physics in 1921.",
        source: "wikipedia",
        importance: 4
    }

];



const result = fuseKnowledge(
    primeFacts,
    webFacts
);



console.log("\nFINAL Prime KNOWLEDGE:\n");


console.log(result);