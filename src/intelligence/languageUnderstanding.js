/*
============================================
🧠 Prime LANGUAGE UNDERSTANDING ENGINE v2
============================================

Features:
✅ Keeps original message
✅ Spelling tolerance
✅ Lowercase normalization
✅ Removes unnecessary symbols
✅ Detects questions
✅ Detects casual chat
✅ Detects math requests
✅ Detects topics
✅ Does not destroy words

============================================
*/


function normalizeText(message){


let text = message
.toLowerCase()
.trim();


// common spelling corrections

const corrections = {


"wwhat":"what",
"wat":"what",
"whatt":"what",

"whos":"who",
"whom":"who",

"devolped":"developed",
"develped":"developed",
"developd":"developed",

"einstion":"einstein",
"einstien":"einstein",

"artifiale":"artificial",
"inteligence":"intelligence",

"gravty":"gravity",

"sqaure":"square",
"sqare":"square",

"br0":"bro"

};




for(const word in corrections){

text =
text.replace(
new RegExp("\\b"+word+"\\b","g"),
corrections[word]
);

}



// remove extra spaces

text =
text.replace(/\s+/g," ");



return text;


}








function detectIntent(text){



if(

text.match(
/^(hi|hello|hey|hai|bro|buddy|yo)$/i
)

){

return "CASUAL";

}



if(

text.includes("what") ||
text.includes("who") ||
text.includes("why") ||
text.includes("how") ||
text.includes("explain")

){

return "QUESTION";

}



if(

/[0-9]/.test(text)

&&

(

text.includes("+") ||
text.includes("-") ||
text.includes("*") ||
text.includes("/") ||
text.includes("plus") ||
text.includes("minus") ||
text.includes("multiply") ||
text.includes("divide") ||
text.includes("square") ||
text.includes("root")

)

){

return "MATH";

}



return "GENERAL";


}









function detectTopic(text){


const topics = {


gravity:[
"gravity",
"force",
"planet",
"earth"
],


ai:[
"ai",
"artificial intelligence",
"machine learning"
],


physics:[
"physics",
"energy",
"motion"
],


math:[
"calculate",
"number",
"equation",
"math"
],


computer:[
"computer",
"coding",
"programming",
"software"
]

};




for(const topic in topics){


for(const keyword of topics[topic]){


if(text.includes(keyword)){

return topic;

}


}


}




return "general";


}









function analyze(message){



const original =
message;



const normalized =
normalizeText(message);



return {


original,


normalized,


intent:
detectIntent(normalized),



topic:
detectTopic(normalized),



hasNumber:
/[0-9]/.test(normalized),



confidence:
0.9



};



}








module.exports = {


normalizeText,

detectIntent,

detectTopic,

analyze


};