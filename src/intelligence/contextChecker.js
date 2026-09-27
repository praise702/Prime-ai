/*
============================================
🧠 Prime CONTEXT CHECKER v1
============================================

Understands sentence context.

Uses:
✅ Nearby words
✅ Topic detection
✅ Word importance

============================================
*/



// ==========================================
// CONTEXT TOPICS
// ==========================================


const contexts = {


ai:[

"artificial",
"intelligence",
"ai",
"machine",
"learning",
"model",
"neural",
"network",
"algorithm"

],



science:[

"gravity",
"physics",
"chemistry",
"biology",
"energy",
"force",
"atom",
"space",
"planet",
"earth"

],



technology:[

"computer",
"software",
"hardware",
"code",
"program",
"server",
"database",
"website",
"application"

],



programming:[

"javascript",
"python",
"node",
"function",
"variable",
"code",
"developer"

]


};





// ==========================================
// FIND SENTENCE TOPIC
// ==========================================


function detectContext(sentence){


const text =
sentence.toLowerCase();



let scores = {};



for(
let topic in contexts
){


scores[topic]=0;



contexts[topic].forEach(word=>{


if(
text.includes(word)
){

scores[topic]++;

}


});


}





let best =
Object.keys(scores)
.sort(
(a,b)=>
scores[b]-scores[a]
)[0];




if(scores[best]===0){

return "general";

}



return best;


}





// ==========================================
// CHECK WORD RELEVANCE
// ==========================================


function contextScore(
word,
sentence
){


const topic =
detectContext(sentence);



if(
contexts[topic]
.includes(word)
){

return 20;

}



return 0;


}





module.exports={


detectContext,

contextScore


};