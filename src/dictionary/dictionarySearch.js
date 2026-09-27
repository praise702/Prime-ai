/**
============================================
🔍 Prime SMART DICTIONARY SEARCH v2
============================================

Features:

✅ Exact matching
✅ Partial matching
✅ Spelling mistake tolerance
✅ Meaning request detection
✅ Word extraction

============================================
*/


function normalize(text){

return text
.toLowerCase()
.replace(/[^\w\s]/g,"")
.trim();

}





function extractWord(query){


query =
normalize(query);



const removeWords = [

"what",
"is",
"the",
"meaning",
"of",
"define",
"definition",
"tell",
"me",
"about",
"word",
"explain"

];



let words =
query.split(/\s+/);



words =
words.filter(

word =>

!removeWords.includes(word)

);





return words[words.length-1];

}







function similarity(a,b){


let score=0;


const length =
Math.min(
a.length,
b.length
);



for(let i=0;i<length;i++){


if(a[i]===b[i]){

score++;

}

}


return score /
Math.max(
a.length,
b.length
);


}









function searchWord(

database,

query

){



const target =
extractWord(query);



if(!target){

return null;

}





let best=null;

let bestScore=0;





for(const item of database){



const word =
normalize(item.word);





let score=0;





// exact

if(word===target){

score=1;

}





// contains

else if(
word.includes(target)
||
target.includes(word)

){

score=0.8;

}





// spelling similarity

else{


score =
similarity(
word,
target
);


}





if(score > bestScore){


bestScore=score;

best=item;


}


}







// minimum confidence

if(bestScore < 0.65){

return null;

}





return best;


}







module.exports={

searchWord

};