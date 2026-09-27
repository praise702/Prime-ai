/**
============================================
🧠 Prime WORDNET ENGINE v7
============================================

FEATURES:

✅ Natural WordNet Integration
✅ Multiple Meaning Ranking
✅ Smart Definition Selection
✅ Synonyms
✅ Examples
✅ Clean Output

Compatible with:
dictionaryEngine.js v3/v4

============================================
*/


const natural = require("natural");

const WordNet = natural.WordNet;

const wordnet = new WordNet();




// ========================================
// SEARCH WORD
// ========================================


async function searchWord(word){


return new Promise((resolve)=>{


try{


const cleanWord =
word
.toLowerCase()
.trim();





wordnet.lookup(
cleanWord,

(results)=>{



if(
!results ||
results.length === 0
){


console.log(
"WORDNET: No definition found for",
cleanWord
);


resolve(null);

return;

}





console.log(
"WORDNET meanings found:",
results.length
);





const best =
selectBestMeaning(results);






resolve({



word:
cleanWord,



type:
convertType(best.pos),



meaning:
cleanDefinition(best.def),



synonyms:
best.synonyms || [],



example:

best.exp &&
best.exp.length

?

best.exp[0]

:

"No example available."



});



}


);



}
catch(error){


console.log(
"WORDNET ERROR:",
error.message
);


resolve(null);


}



});


}









// ========================================
// SMART MEANING SELECTOR
// ========================================


function selectBestMeaning(results){



const positiveWords = [


"plant",
"green",
"vegetation",
"herb",
"leaf",
"leaves",
"field",
"lawn",
"ground",
"grow",
"growing",
"grass",
"pasture",
"crop"

];



const negativeWords = [


"marijuana",
"drug",
"slang",
"pot",
"weed",
"betray",
"informant"

];





let best =
results[0];


let bestScore =
-999;






for(const item of results){



const definition =

(item.def || "")
.toLowerCase();



let score = 0;





// reward useful meanings

for(const word of positiveWords){


if(
definition.includes(word)
){

score += 10;

}


}







// remove unwanted meanings

for(const word of negativeWords){


if(
definition.includes(word)
){

score -= 25;

}


}






// Prefer nouns

if(item.pos === "n"){

score += 5;

}






if(score > bestScore){


bestScore = score;

best = item;


}



}






return best;


}









// ========================================
// PART OF SPEECH
// ========================================


function convertType(pos){



switch(pos){


case "n":
return "noun";


case "v":
return "verb";


case "a":
return "adjective";


case "r":
return "adverb";


default:
return "unknown";


}


}









// ========================================
// CLEAN TEXT
// ========================================


function cleanDefinition(text){


if(!text){

return "Meaning unavailable.";

}



return text
.replace(/\s+/g," ")
.trim();


}









module.exports = {


searchWord


};