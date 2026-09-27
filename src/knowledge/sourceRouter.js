/*
============================================
🌐 Prime SOURCE ROUTER v2
============================================

Decides which knowledge source to use.

Sources:

✅ Wikipedia
✅ arXiv
✅ Wikibooks
✅ OpenAlex
✅ SEP

============================================
*/


function detectSources(message){


const text =
message.toLowerCase();



let sources=[];




// ========================================
// PHILOSOPHY
// ========================================


if(

text.includes("philosophy") ||

text.includes("philosopher") ||

text.includes("ethics") ||

text.includes("morality") ||

text.includes("metaphysics")

){

sources.push("sep");

}





// ========================================
// SCIENCE + RESEARCH
// ========================================


if(

text.includes("research") ||

text.includes("paper") ||

text.includes("study") ||

text.includes("experiment") ||

text.includes("physics") ||

text.includes("biology") ||

text.includes("chemistry") ||

text.includes("science") ||

text.includes("latest") ||

text.includes("new discovery")

){

sources.push("arxiv");

}








// ========================================
// BOOKS / LEARNING
// ========================================


if(

text.includes("learn") ||

text.includes("tutorial") ||

text.includes("book") ||

text.includes("guide") ||

text.includes("how to") ||

text.includes("course")

){

sources.push("wikibooks");

}








// ========================================
// ACADEMIC DATABASE
// ========================================


if(

text.includes("academic") ||

text.includes("journal") ||

text.includes("citation") ||

text.includes("researcher") ||

text.includes("university")

){

sources.push("openalex");

}







// ========================================
// AI SPECIFIC RESEARCH
// ========================================


if(

text.includes("ai") ||

text.includes("artificial intelligence") ||

text.includes("machine learning") ||

text.includes("deep learning") ||

text.includes("neural network")

){

sources.push("arxiv");

sources.push("openalex");

}








// ========================================
// REMOVE DUPLICATES
// ========================================


sources = [

...new Set(sources)

];








// ========================================
// DEFAULT
// ========================================


if(

sources.length===0

){

sources.push("wikipedia");

}





return sources;


}







module.exports={

detectSources

};