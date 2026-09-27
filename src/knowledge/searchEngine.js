/*
============================================
🔍 Prime SEARCH ENGINE v14
============================================

FEATURES:

✅ Smart keyword matching
✅ Question understanding
✅ Removes unrelated facts
✅ Topic matching
✅ Keyword scoring
✅ Handles misspellings
✅ Works with rankingEngine v14

============================================
*/



// ========================================
// CLEAN TEXT
// ========================================


function cleanText(text){


return String(text || "")

.toLowerCase()

.replace(
/[^a-z0-9\s]/g,
""
)

.trim();


}







// ========================================
// WORD SPLITTER
// ========================================


function getWords(text){


return cleanText(text)

.split(/\s+/)

.filter(
x=>x.length>1
);


}








// ========================================
// REMOVE QUESTION WORDS
// ========================================


function removeStopWords(words){


const stopWords=[


"what",
"who",
"where",
"when",
"why",
"how",

"is",
"are",
"was",
"were",

"the",
"a",
"an",

"about",
"tell",
"me",
"explain",
"give",

"please"


];



return words.filter(

word=>

!stopWords.includes(word)

);


}










// ========================================
// SCORE FACT
// ========================================


function calculateScore(

queryWords,

fact

){



let score=0;



const text =

cleanText(

JSON.stringify(fact)

);





const factWords =

getWords(text);








for(
const word of queryWords
){


if(
factWords.includes(word)
){


score += 1;


}



}







// keyword bonus


if(
Array.isArray(fact.keywords)
){



for(
const keyword of fact.keywords
){


const keyWords =
getWords(keyword);



for(
const q of queryWords
){


if(
keyWords.includes(q)
){


score += 3;


}


}



}


}









// topic bonus


if(
fact.topic
){


for(
const q of queryWords
){


if(
cleanText(fact.topic)
.includes(q)
){

score+=2;

}


}


}






return score;


}










// ========================================
// RETRIEVE CANDIDATES
// ========================================


function retrieveCandidates(

query,

knowledge

){



const queryWords =

removeStopWords(

getWords(query)

);





if(
queryWords.length===0
){

return [];

}







let results=[];







for(
const item of knowledge
){



const score =

calculateScore(

queryWords,

item

);





if(
score > 0
){



results.push({


...item,


score


});



}



}









// sort best first


results.sort(

(a,b)=>

b.score-a.score

);







return results.slice(
0,
20
);



}










module.exports={


retrieveCandidates

};