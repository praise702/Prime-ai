/*
========================================
🚀 Prime TRANSLATOR TOOL v1
========================================

Handles basic offline translations.

Future:
- API translation
- More languages
- Auto language detection

========================================
*/


const dictionary = {


    // English → Spanish

    "hello spanish":
    "hola",

    "hi spanish":
    "hola",

    "thank you spanish":
    "gracias",

    "good morning spanish":
    "buenos días",



    // English → French

    "hello french":
    "bonjour",

    "thank you french":
    "merci",

    "good morning french":
    "bonjour",



    // English → German

    "hello german":
    "hallo",

    "thank you german":
    "danke",



    // English → Japanese

    "hello japanese":
    "こんにちは",

    "thank you japanese":
    "ありがとう"



};







function translate(message){


const text =
message
.toLowerCase()
.trim();





// Remove common words

let clean =
text
.replace(
"translate",
""
)
.replace(
"what is",
""
)
.replace(
"how to say",
""
)
.trim();






for(
const key in dictionary
){


if(
clean.includes(key)
){


return dictionary[key];


}


}







return null;


}








module.exports={

translate

};