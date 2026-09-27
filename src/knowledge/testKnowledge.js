const knowledgeManager = require("./knowledgeManager");


console.log("🚀 Testing Prime Knowledge Manager\n");


// Load test
knowledgeManager.loadKnowledge();


// Search test
const result = knowledgeManager.searchKnowledge(
    "Artificial Intelligence"
);


console.log("\n🔍 Search Result:\n");

console.log(result);