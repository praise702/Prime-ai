/*
============================================
🌐 Prime WIKIPEDIA CONNECTOR v1
============================================

FEATURES:

✅ Wikipedia API Search
✅ Summary Retrieval
✅ Clean Results
✅ Error Handling

============================================
*/


const axios =
require("axios");





const name =
"Wikipedia";







// ========================================
// SEARCH WIKIPEDIA
// ========================================


async function search(query){


try{



console.log(
"🌐 Wikipedia searching:",
query
);





// Search article


const searchResponse =

await axios.get(

"https://en.wikipedia.org/w/api.php",

{

params:{


action:"query",


list:"search",


srsearch:query,


format:"json"



}

}

);






const results =

searchResponse.data.query.search;





if(

!results ||

results.length===0

){


return [];

}








let output=[];







// Get top 3 results


for(

let i=0;

i<Math.min(3,results.length);

i++

){



const title =

results[i].title;








try{



const summary =

await axios.get(

`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`

);







if(

summary.data.extract

){



output.push({


source:"Wikipedia",


title:title,


text:

summary.data.extract,


url:

summary.data.content_urls?.desktop?.page || null



});



}



}

catch(error){


console.log(

"Wikipedia summary error:",

error.message

);


}



}







return output;



}

catch(error){



console.log(

"Wikipedia API error:",

error.message

);



return [];



}



}









module.exports={


name,

search


};