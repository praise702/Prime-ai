/*
============================================
🧠 Prime SIMILARITY ENGINE v1
============================================

Finds how close two words are.

Uses:
✅ Levenshtein Distance
✅ Similarity Score

============================================
*/


// ==========================================
// LEVENSHTEIN DISTANCE
// ==========================================


function levenshtein(a,b){


a = a.toLowerCase();
b = b.toLowerCase();



const matrix = [];



for(let i=0;i<=b.length;i++){

matrix[i]=[i];

}



for(let j=0;j<=a.length;j++){

matrix[0][j]=j;

}





for(let i=1;i<=b.length;i++){


for(let j=1;j<=a.length;j++){



if(
b[i-1] === a[j-1]
){


matrix[i][j] =
matrix[i-1][j-1];


}

else{


matrix[i][j] =
Math.min(

matrix[i-1][j]+1,

matrix[i][j-1]+1,

matrix[i-1][j-1]+1

);


}



}


}



return matrix[b.length][a.length];


}





// ==========================================
// SIMILARITY PERCENTAGE
// ==========================================


function similarity(word1,word2){



if(word1===word2)
return 100;



let distance =
levenshtein(
word1,
word2
);



let maxLength =
Math.max(
word1.length,
word2.length
);



if(maxLength===0)
return 100;



let score =
(
1 -
distance/maxLength
)
*100;



return Math.round(score);


}





module.exports={

levenshtein,

similarity

};