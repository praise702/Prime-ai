/**
============================================
🧠 Prime MEANING RANKER v1
============================================

Chooses the most useful meaning from WordNet
============================================
*/


function scoreMeaning(result){


let score = 0;


const meaning =
(result.meaning || "")
.toLowerCase();




// Common meaning words

const positiveWords = [

"plant",
"green",
"leaf",
"leaves",
"ground",
"garden",
"field",
"nature",
"grow",
"living",
"organism",
"tree",
"flower"

];



positiveWords.forEach(word => {


if(meaning.includes(word)){

score += 5;

}


});




// Reduce slang meanings

const negativeWords = [

"marijuana",
"drug",
"slang",
"street",
"betray",
"snitch"

];


negativeWords.forEach(word => {


if(meaning.includes(word)){

score -= 5;

}


});



return score;


}






function chooseBestMeaning(results){



if(!results || results.length === 0){

return null;

}



let best = results[0];

let bestScore =
scoreMeaning(best);



for(
let i = 1;
i < results.length;
i++
){


let currentScore =
scoreMeaning(results[i]);



if(currentScore > bestScore){


best = results[i];

bestScore = currentScore;


}


}



return best;


}






module.exports = {


chooseBestMeaning


};