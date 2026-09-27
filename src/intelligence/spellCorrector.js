/*
============================================
🧠 Prime SMART SPELL CORRECTOR v1
============================================

Features:

✅ Word similarity matching
✅ Vocabulary search
✅ Context understanding
✅ Sentence correction
✅ AI terminology support

============================================
*/


const {
    similarity
} =
require("./similarity");


const vocabulary =
require("./vocabulary");


const contextChecker =
require("./contextChecker");





// ==========================================
// BASIC WORD CLEANER
// ==========================================


function cleanWord(word){


return word
.toLowerCase()
.replace(/[.,!?;:"']/g,"");


}





// ==========================================
// FIND BEST WORD MATCH
// ==========================================


function findBestMatch(
word,
sentence
){



let bestWord = word;

let bestScore = 0;




for(
const vocabWord of vocabulary
){



let score =
similarity(
word,
vocabWord
);





// Add context advantage

score +=
contextChecker.contextScore(
vocabWord,
sentence
);





if(
score > bestScore
){

bestScore = score;

bestWord = vocabWord;

}


}




/*

Only replace if confidence
is high enough.

*/

if(
bestScore >= 65
){

return bestWord;

}



return word;



}







// ==========================================
// CORRECT SENTENCE
// ==========================================


function correctSentence(sentence){



if(!sentence)
return "";





let words =
sentence.split(" ");




let correctedWords =
words.map(word=>{



let clean =
cleanWord(word);



let corrected =
findBestMatch(
clean,
sentence
);





return corrected;



});





return correctedWords.join(" ");



}





module.exports = {


correctSentence


};