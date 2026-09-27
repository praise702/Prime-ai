/*
============================================
📚 Prime KNOWLEDGE LOADER v14
============================================
*/


const fs = require("fs");
const path = require("path");





function loadKnowledge(folder){


let allFacts=[];



try{


const files =

fs.readdirSync(folder);



files.forEach(file=>{


if(
file.endsWith(".json")
){



const filePath =

path.join(
folder,
file
);



const data =

require(filePath);





// OLD FORMAT SUPPORT

if(
data.facts &&
Array.isArray(data.facts)
){



allFacts.push(
...data.facts
);



}



// NEW FORMAT SUPPORT

else if(
Array.isArray(data)
){



allFacts.push(
...data
);



}



}



});





console.log(
"📚 Knowledge files loaded:",
files.length
);



console.log(
"📖 Total facts:",
allFacts.length
);



return allFacts;



}

catch(error){


console.log(
"❌ Knowledge loader error:",
error.message
);



return [];

}



}






module.exports={

loadKnowledge

};