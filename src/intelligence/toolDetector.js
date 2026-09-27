/*
========================================
🚀 Prime TOOL DETECTOR v3
========================================

Detects:

🧮 Calculator
📏 Unit Converter
⏰ Date Time
🌍 Translator
📁 File Reader
🔍 Search

========================================
*/


function detect(message){


const text =
message
.toLowerCase()
.trim();





// =================================
// 🧮 CALCULATOR
// =================================


const mathWords = [

"calculate",

"plus",

"add",

"minus",

"subtract",

"multiply",

"multiplied",

"times",

"divide",

"divided",

"percentage",

"percent",

"square root",

"power",

"raised"

];





// Pure numbers/math symbols

if(
/^[0-9+\-*/().\s]+$/.test(text)
){


return {

tool:"calculator",

confidence:100

};


}





for(
const word of mathWords
){


if(
text.includes(word)
){


return {

tool:"calculator",

confidence:95

};


}


}









// =================================
// 📏 UNIT CONVERTER
// =================================


const units = [

"km",

"meter",

"metre",

"cm",

"mm",

"kg",

"gram",

"g",

"celsius",

"fahrenheit",

"feet",

"inch"

];





if(

text.includes("convert") ||

text.includes(" to ") ||

text.includes(" into ")

){


for(
const unit of units
){


if(
text.includes(unit)
){


return {

tool:"unitConverter",

confidence:95

};


}


}


}









// =================================
// ⏰ DATE TIME
// =================================


if(

text.includes("time") ||

text.includes("date") ||

text.includes("today") ||

text.includes("clock")

){


return {

tool:"dateTime",

confidence:95

};


}









// =================================
// 🌍 TRANSLATOR
// =================================


if(

text.includes("translate") ||

text.includes("meaning in") ||

text.includes("say in")

){


return {


tool:"translator",

confidence:90


};


}









// =================================
// 📁 FILE READER
// =================================


if(

text.includes("read file") ||

text.includes("open file") ||

text.includes("analyze file") ||

text.includes("scan file")

){


return {


tool:"fileReader",

confidence:90


};


}









// =================================
// 🔍 SEARCH
// =================================


const searchWords = [

"latest",

"news",

"current",

"weather",

"price",

"recent",

"today"

];





for(
const word of searchWords
){


if(
text.includes(word)
){


return {


tool:"search",

confidence:90


};


}


}









return {


tool:null,

confidence:0


};



}







module.exports={

detect

};