/*
============================================
📖 Prime DICTIONARY ENGINE v14
============================================

FEATURES:

✅ Smart definition detection
✅ WordNet support
✅ Local dictionary support
✅ Question filtering
✅ Prevents wrong definitions
✅ Better word extraction

============================================
*/


const wordListEngine =
require("./wordListEngine");


const wordnetEngine =
require("./wordnetEngine");





// ========================================
// LOAD LOCAL DEFINITIONS
// ========================================


let localDictionary=[];


try{


localDictionary =
require("./definitions.json");


console.log(
"📖 Local dictionary loaded:",
localDictionary.length
);


}

catch(error){


console.log(
"📖 No local dictionary found"
);


}









// ========================================
// CHECK IF DEFINITION QUESTION
// ========================================


function isDefinitionQuestion(message){


const text =
message.toLowerCase();





// Block identity questions


if(
text.includes("who") ||
text.includes("why") ||
text.includes("how")
){

return false;

}






return (

text.includes("what is") ||

text.includes("define") ||

text.includes("meaning of") ||

text.startsWith("meaning")

);


}









// ========================================
// EXTRACT WORD
// ========================================


function extractWord(message){



let words =

message

.toLowerCase()

.replace(
"?",
""
)

.split(/\s+/);







const remove=[


"what",
"is",
"the",
"a",
"an",
"meaning",
"of",
"define",
"definition",
"tell",
"me",
"about"


];







for(
const word of words
){



if(
word &&
!remove.includes(word)
){


return word;


}



}




return "";

}









// ========================================
// LOCAL SEARCH
// ========================================


function findLocal(word){



return localDictionary.find(item=>{


return (

item.word &&

item.word.toLowerCase()
===
word.toLowerCase()

);



}) || null;



}









// ========================================
// CLEAN OUTPUT
// ========================================


function cleanResult(data){



if(!data)
return null;





return {


word:data.word,


type:data.type || "unknown",


meaning:

data.meaning || 
"Meaning unavailable.",



example:

data.example ||
"No example available."



};



}









// ========================================
// MAIN ANALYZE
// ========================================


async function analyze(message){


try{



if(
!isDefinitionQuestion(message)
){

console.log(
"📖 Dictionary skipped"
);


return null;


}








const word =

extractWord(message);





if(
!word
){

return null;

}








console.log(
"📖 Dictionary searching:",
word
);








// Check word exists


if(
!wordListEngine.wordExists(word)
){


console.log(
"❌ Not dictionary word"
);


return null;


}








// Local dictionary first


const local =

findLocal(word);



if(local){



return cleanResult(local);


}








// WordNet


const result =

await wordnetEngine.searchWord(
word
);






if(result){



return cleanResult(result);


}








return null;



}

catch(error){


console.log(
"❌ Dictionary error:",
error.message
);



return null;


}



}








module.exports={


analyze


};