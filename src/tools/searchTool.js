/*
========================================
🚀 Prime SEARCH TOOL v1
========================================

Handles external information requests.

Current:
✅ Search request detection
✅ Search structure ready

Future:
- Google Search API
- Bing API
- Custom web crawler
- RAG system

========================================
*/



function search(message){


const text =
message
.toLowerCase()
.trim();




// Detect search request


const keywords = [

"latest",

"today",

"current",

"news",

"recent",

"weather",

"price",

"cost",

"release",

"update",

"who is",

"what happened",

"where is"

];





let needsSearch = false;



for(
const word of keywords
){

if(
text.includes(word)
){

needsSearch = true;

break;

}

}






if(!needsSearch){


return null;


}






return {


type:"search",


query:message,


answer:

"🔍 Search request detected. External search connection required."



};



}






module.exports={

search

};