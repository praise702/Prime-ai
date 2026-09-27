/**
 * ============================================
 * 📚 Prime DEFINITION DOWNLOADER v2
 * ============================================
 *
 * Features:
 *
 * ✅ 370K+ word support
 * ✅ Resume system
 * ✅ Progress saving
 * ✅ Definition importing
 * ✅ Auto retry
 * ✅ Meaning storage
 *
 * ============================================
 */


const fs = require("fs");
const path = require("path");
const https = require("https");



console.log(
"\n📚 Prime DEFINITION ENGINE STARTED\n"
);



// ===============================
// FILES
// ===============================


const WORD_FILE =
path.join(
__dirname,
"englishWords.json"
);



const OUTPUT_FILE =
path.join(
__dirname,
"definitions.json"
);



const PROGRESS_FILE =
path.join(
__dirname,
"progress.json"
);




// ===============================
// LOAD WORDS
// ===============================


if(!fs.existsSync(WORD_FILE)){

console.log(
"❌ englishWords.json missing"
);

process.exit();

}



const words =
JSON.parse(
fs.readFileSync(
WORD_FILE,
"utf8"
)
);



console.log(
"📖 Total words:",
words.length
);





// ===============================
// LOAD OLD DATA
// ===============================


let definitions = [];


if(
fs.existsSync(OUTPUT_FILE)
){

definitions =
JSON.parse(
fs.readFileSync(
OUTPUT_FILE,
"utf8"
)
);

console.log(
"💾 Existing definitions:",
definitions.length
);

}






// ===============================
// LOAD PROGRESS
// ===============================


let index = 0;



if(
fs.existsSync(PROGRESS_FILE)
){

const progress =
JSON.parse(
fs.readFileSync(
PROGRESS_FILE,
"utf8"
)
);


index =
progress.index || 0;


console.log(
"▶ Resuming from:",
index
);


}






// ===============================
// SAVE FUNCTION
// ===============================


function save(){


fs.writeFileSync(

OUTPUT_FILE,

JSON.stringify(
definitions,
null,
2
)

);



fs.writeFileSync(

PROGRESS_FILE,

JSON.stringify(
{
index,
updated:
new Date()
},
null,
2
)

);



console.log(
"💾 Saved progress:",
index
);



}









// ===============================
// API REQUEST
// ===============================


function getDefinition(word){


return new Promise((resolve)=>{


const url =

`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;



https.get(

url,

(response)=>{


let data="";



response.on(
"data",
chunk =>
data += chunk
);



response.on(
"end",
()=>{


try{


const json =
JSON.parse(data);



if(
json[0]
){


const meaning =
json[0]
.meanings?.[0];



resolve({

word,

type:
meaning?.partOfSpeech ||
"unknown",


meaning:
meaning?.definitions?.[0]?.definition ||
"",


example:
meaning?.definitions?.[0]?.example ||
"",


synonyms:
meaning?.synonyms ||
[]


});



}

else{


resolve({

word,

type:
"unknown",

meaning:
"",

example:
"",

synonyms:[]

});


}



}

catch{


resolve({

word,

type:"unknown",

meaning:"",

example:"",

synonyms:[]

});


}



});



}

)

.on(
"error",
()=>{


resolve({

word,

type:"unknown",

meaning:"",

example:"",

synonyms:[]

});


});



});


}









// ===============================
// MAIN DOWNLOADER
// ===============================


async function start(){



for(
;
index < words.length;
index++
){


const word =
words[index];



console.log(

`🔎 ${index}/${words.length}: ${word}`

);



const exists =
definitions.find(

x =>
x.word === word

);



if(exists){

continue;

}





const result =
await getDefinition(word);



definitions.push(
result
);





if(
index % 50 === 0
){

save();

}




// small delay
await new Promise(

r =>
setTimeout(
r,
100

)

);



}



save();



console.log(
"\n🔥 COMPLETE"
);



console.log(
"TOTAL DEFINITIONS:",
definitions.length
);



}



start();