/*
============================================
📚 Prime KNOWLEDGE MANAGER v14
============================================

FEATURES:

✅ Knowledge loading
✅ Smart search routing
✅ Keyword matching
✅ Question understanding
✅ Confidence filtering
✅ Prevent random facts
✅ Better AI answers

============================================
*/


const fs =
require("fs");

const path =
require("path");


const searchEngine =
require("./searchEngine");


const rankingEngine =
require("./rankingEngine");





let knowledgeCache = [];






// ========================================
// LOAD KNOWLEDGE
// ========================================


function loadKnowledge(){


if(
knowledgeCache.length > 0
){

return knowledgeCache;

}




try{


const folder =
path.join(
__dirname,
"knowledge"
);



let files =
fs.readdirSync(folder);



let knowledge=[];



for(
const file of files
){



if(
file.endsWith(".json")
){

const data =
require(
path.join(folder,file)
);



if(
Array.isArray(data) || Array.isArray(data?.facts)
){

knowledge.push(
...(Array.isArray(data) ? data : data.facts.map(fact => ({ ...fact, title: fact.title || data.category || "Prime Knowledge", text: fact.text || fact.answer || fact.question || "", source: fact.source || "Prime Knowledge", type: fact.type || "local", retrievedAt: new Date().toISOString() })))
);

}


}



}




knowledgeCache =
knowledge;



console.log(
"📚 Knowledge Loaded:",
knowledgeCache.length
);



return knowledgeCache;



}

catch(error){


console.log(
"❌ Knowledge loading error:",
error.message
);


return [];

}



}









// ========================================
// CLEAN QUERY
// ========================================


function cleanQuery(text){


return text

.toLowerCase()

.replace(
/[^a-z0-9\s]/g,
""
)

.trim();


}









// ========================================
// BLOCK BAD SEARCHES
// ========================================


function isInvalidQuery(query){


const text =
query.toLowerCase().trim();



const words =
text.split(/\s+/);



if(
words.length===1 &&
words[0].length<3
){

return true;

}



const randomPattern =
/^[a-z]{1,3}[0-9]+|^[0-9]+[a-z]+/;



if(
randomPattern.test(text)
){

return true;

}



return false;


}









// ========================================
// SEARCH KNOWLEDGE
// ========================================


function searchKnowledge(query){



const cleaned =
cleanQuery(query);



if(
!cleaned ||
isInvalidQuery(cleaned)
){

console.log(
"🚫 Invalid knowledge query"
);


return [];

}






const knowledge =
loadKnowledge();



if(
knowledge.length===0
){

return [];

}







// Search candidates


const candidates =
searchEngine.retrieveCandidates(

cleaned,

knowledge

);





if(
!candidates ||
candidates.length===0
){

console.log(
"📚 No candidates found"
);


return [];

}








// Rank results


const ranked =
rankingEngine.rankFacts(

candidates,

cleaned

);








const final =
ranked.filter(item=>{


if(
typeof item.score === "number"
){

return item.score >= 0.55;

}



return true;



});









console.log(
"📚 Knowledge Matches:",
final.length
);







return final.slice(0,8);



}










function getKnowledge(){


return loadKnowledge();


}





function clearCache(){


knowledgeCache=[];


}








module.exports={


loadKnowledge,

getKnowledge,

searchKnowledge,

clearCache


};
