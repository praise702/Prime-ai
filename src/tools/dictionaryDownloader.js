/**
============================================
📥 Prime DICTIONARY DOWNLOADER v1
============================================

Downloads large dictionary data

Features:

✅ Automatic download
✅ Saves raw database
✅ Ready for importer

============================================
*/


const axios = require("axios");
const fs = require("fs");
const path = require("path");



const URL =
"https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json";



const output =
path.join(
__dirname,
"rawWords.json"
);






async function downloadDictionary(){


try{


console.log(
"📥 Downloading dictionary..."
);





const response =
await axios.get(
URL
);







fs.writeFileSync(

output,

JSON.stringify(

response.data,

null,

2

)

);






console.log(
"✅ Dictionary downloaded"
);



console.log(

"📚 Words:",

Object.keys(
response.data
).length

);



}



catch(error){


console.log(
"❌ Download failed"
);


console.log(
error.message
);


}



}






downloadDictionary();