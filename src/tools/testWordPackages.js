const wordList = require("an-array-of-english-words");
const jsonWords = require("word-list-json");


console.log("===== an-array-of-english-words =====");

console.log(
    "Total words:",
    wordList.length
);

console.log(
    "Has grass:",
    wordList.includes("grass")
);

console.log(
    "Has computer:",
    wordList.includes("computer")
);

console.log(
    "Has anandrarious:",
    wordList.includes("anandrarious")
);



console.log("\n===== word-list-json =====");

console.log(
    "Type:",
    typeof jsonWords
);

console.log(
    "Constructor:",
    jsonWords.constructor.name
);

console.log(
    "Sample:",
    jsonWords.slice(0,5)
);