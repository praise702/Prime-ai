/*
============================================
🌐 Prime WIKIPEDIA ENGINE v14
============================================

FEATURES:

✅ Wikipedia API connection
✅ Search articles
✅ Extract summaries
✅ Remove useless results
✅ Error handling
✅ Clean answers
✅ Works with brain.js

============================================
*/


const axios = require("axios");





// ========================================
// CLEAN TEXT
// ========================================


function cleanText(text){


if(!text)
return "";


return text

.replace(/\s+/g," ")

.trim();


}







// ========================================
// SEARCH WIKIPEDIA
// ========================================


async function searchWikipedia(query){


try{


console.log(
"🌐 Wikipedia searching:",
query
);





// Step 1:
// Find best article


const searchResponse =

await axios.get(

"https://en.wikipedia.org/w/api.php",

{


params:{


action:"query",

format:"json",

list:"search",

srsearch:query,

srlimit:1


},


headers:{


"User-Agent":
"Prime/1.0"

}



}

);







const results =

searchResponse.data
.query
.search;







if(

!results ||

results.length===0

){


return null;


}







const title =

results[0].title;








// Step 2:
// Get summary


const summaryResponse =

await axios.get(


`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,


{


headers:{


"User-Agent":
"Prime/1.0"


}


}


);








const data =

summaryResponse.data;








if(

!data.extract

){


return null;


}









return {


source:
"Wikipedia",


title:
data.title,


answer:
cleanText(
data.extract
),


url:
data.content_urls
?.desktop
?.page || null


};






}

catch(error){


console.log(

"❌ Wikipedia Error:",

error.message

);



return null;


}



}









// ========================================
// MULTI SEARCH
// ========================================


async function searchMultipleWikipedia(

queries=[]

){



let results=[];




for(
const query of queries
){


const result =

await searchWikipedia(query);



if(result){

results.push(result);

}



}



return results;


}









module.exports={


searchWikipedia,


searchMultipleWikipedia


};