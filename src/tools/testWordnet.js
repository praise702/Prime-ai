const wordnet =
require("../dictionary/wordnetEngine");


const words = [

"grass",

"computer",

"apple",

"intelligence"

];



for(const word of words){


console.log("\n================");

console.log(
"WORD:",
word
);



const result =
wordnet.search(word);



console.log(result);



}