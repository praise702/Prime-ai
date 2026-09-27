/**
============================================
📚 Prime 100K DICTIONARY IMPORTER v2
============================================

Supports:

✅ 100,000+ words
✅ Automatic A-Z split
✅ Duplicate removal
✅ Sorting
✅ Fast loading

============================================
*/


const fs = require("fs");
const path = require("path");



const input =
path.join(
__dirname,
"englishWords.json"
);



const output =
path.join(

__dirname,

"../dictionary/dictionaryData"

);






function start(){



if(!fs.existsSync(input)){


console.log(
"❌ englishWords.json missing"
);


return;


}







if(!fs.existsSync(output)){


fs.mkdirSync(
output,
{
recursive:true
}
);


}







const data =
JSON.parse(

fs.readFileSync(
input,
"utf8"
)

);





let database={};





for(
let i=65;
i<=90;
i++
){


database[
String.fromCharCode(i)
]
=[];


}








data.forEach(item=>{



if(
!item.word
){

return;

}



const word =
item.word
.toLowerCase()
.trim();





const letter =
word[0]
.toUpperCase();





if(database[letter]){



database[letter].push({

word,

type:
item.type || "unknown",

meaning:
item.meaning || "",

example:
item.example || ""

});


}



});









for(const letter in database){



const unique = 
Array.from(

new Map(

database[letter]
.map(
x=>[
x.word,
x
]
)

).values()

);






unique.sort(
(a,b)=>
a.word.localeCompare(
b.word
)

);






fs.writeFileSync(

path.join(

output,

`${letter}.json`

),


JSON.stringify(

unique,

null,

2

)


);



console.log(

letter,

":",

unique.length,

"words"

);



}







console.log(
"🔥 100K DICTIONARY CREATED"
);



console.log(
"TOTAL:",
data.length
);



}






start();