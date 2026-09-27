/*
============================================
🏆 Prime RANKING ENGINE v14
============================================

FEATURES:

✅ Smart fact ranking
✅ Keyword priority
✅ Question matching
✅ Importance scoring
✅ Topic matching
✅ Confidence calculation

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
// WORD MATCH
// ========================================


function wordMatch(query,factText){


const queryWords =

cleanText(query)

.split(/\s+/);



const factWords =

cleanText(factText)

.split(/\s+/);



let score=0;



for(
const word of queryWords
){


if(
word.length > 2 &&
factWords.includes(word)
){

score++;

}


}



return score;


}










// ========================================
// KEYWORD SCORE
// ========================================


function keywordScore(query,item){


let score=0;



if(
!Array.isArray(item.keywords)
){

return score;

}




for(
const keyword of item.keywords
){



if(
cleanText(query)
.includes(
cleanText(keyword)
)

){

score += 10;

}



}




return score;


}









// ========================================
// IMPORTANCE SCORE
// ========================================


function importanceScore(item){


if(
typeof item.importance === "number"
){

return item.importance * 2;

}



return 0;


}









// ========================================
// QUESTION MATCH
// ========================================


function questionScore(query,item){


if(
!item.question
){

return 0;

}



const q =
cleanText(query);


const stored =
cleanText(item.question);



if(
q === stored
){

return 30;

}



let score=0;



const words =
q.split(" ");



for(
const word of words
){


if(
stored.includes(word)
){

score+=2;

}


}



return score;


}









// ========================================
// MAIN RANK FUNCTION
// ========================================


function rankFacts(

facts,

query

){



if(
!Array.isArray(facts)
){

return [];

}






const ranked =

facts.map(item=>{



let score = 0;






// Existing search score

if(
typeof item.score==="number"
){

score += item.score;

}







// Keyword priority

score +=

keywordScore(
query,
item
);







// Question similarity

score +=

questionScore(
query,
item
);







// Importance

score +=

importanceScore(
item
);







// General word match

score +=

wordMatch(

query,

JSON.stringify(item)

);









return {


...item,


score


};





});








ranked.sort(

(a,b)=>

b.score-a.score

);








console.log(
"🏆 Ranking completed:",
ranked.length
);







return ranked;



}









module.exports={


rankFacts

};