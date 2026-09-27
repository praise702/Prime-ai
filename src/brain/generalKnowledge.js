/*
========================================
🚀 Prime GENERAL KNOWLEDGE ENGINE
========================================

Features:

✅ Raw knowledge access
✅ Keyword understanding
✅ Question cleaning
✅ Partial matching
✅ Explanation fallback
✅ Human style answers

========================================
*/


const fs = require("fs");
const path = require("path");



let rawKnowledge = [];





// =================================
// LOAD RAW KNOWLEDGE
// =================================


function loadRawKnowledge(){


try{


const folder =
path.join(
__dirname,
"raw"
);



const files =
fs.readdirSync(folder);



rawKnowledge = [];



files.forEach(file=>{


if(
file.endsWith(".json")
){


const data =
require(
path.join(folder,file)
);


rawKnowledge.push(
...data
);


}


});



console.log(
"📚 RAW KNOWLEDGE LOADED:",
rawKnowledge.length
);



}


catch(error){


console.log(
"⚠️ Raw knowledge folder not found"
);



}



}








// =================================
// CLEAN QUESTION
// =================================


function clean(text){


return text
.toLowerCase()
.replace(/[.,!?]/g,"")
.trim();


}








// =================================
// SEARCH RAW KNOWLEDGE
// =================================


function search(question){



const query =
clean(question);



if(
rawKnowledge.length===0
){

loadRawKnowledge();

}






for(
const item of rawKnowledge
){



const title =
clean(
item.title || ""
);



const keywords =
(item.keywords || [])
.map(k=>clean(k));





if(

query.includes(title)

){


return item.answer;


}






for(
const word of keywords
){



if(
query.includes(word)
){


return item.answer;


}


}



}






return null;



}









// =================================
// GENERATE FALLBACK
// =================================


function generateReply(question){



const answer =
search(question);



if(answer){

return answer;

}






return `

I understand you are asking about:

"${question}"

I could not find a direct answer in my current knowledge database.

Try asking with more details, for example:

• Explain this topic
• Tell me about this
• How does this work?

I will continue improving my knowledge.

`;



}








module.exports={


loadRawKnowledge,

search,

generateReply


};