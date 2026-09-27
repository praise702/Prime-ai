/*
============================================
📖 Prime WIKIBOOKS CONNECTOR v1
============================================

FEATURES:

✅ Wikibooks API Search
✅ Learning Content Retrieval
✅ Clean Results
✅ Error Protection

============================================
*/


const axios =
require("axios");





const name =
"Wikibooks";









// ========================================
// CLEAN TEXT
// ========================================


function clean(text){


if(!text)

return "";



return text

.replace(/<[^>]*>/g," ")

.replace(/\s+/g," ")

.trim();


}









// ========================================
// SEARCH WIKIBOOKS
// ========================================


async function search(query){



try{



console.log(

"📖 Wikibooks searching:",

query

);






// Search Wikibooks


const response =

await axios.get(

"https://en.wikibooks.org/w/api.php",

{

params:{



action:"query",



list:"search",



srsearch:query,



format:"json"



},



headers:{


"User-Agent":

"Prime/1.0"

}



}

);







const pages =

response.data.query?.search || [];






if(

pages.length===0

){


return [];

}






let results=[];









for(

let i=0;

i<Math.min(3,pages.length);

i++

){



const title =

pages[i].title;






try{



const page =

await axios.get(

"https://en.wikibooks.org/w/api.php",

{

params:{


action:"query",


prop:"extracts",


exintro:true,


explaintext:true,


titles:title,


format:"json"



},



headers:{


"User-Agent":

"Prime/1.0"

}



}

);








const data =

page.data.query.pages;







const key =

Object.keys(data)[0];







const extract =

clean(

data[key].extract

);







if(

extract.length>30

){



results.push({



source:"Wikibooks",



title:title,



text:extract,



url:

`https://en.wikibooks.org/wiki/${encodeURIComponent(title)}`



});



}



}

catch(error){



console.log(

"Wikibooks page error:",

error.message

);



}



}








return results;



}

catch(error){



console.log(

"❌ Wikibooks API error:",

error.message

);



return [];



}



}









module.exports={


name,


search


};