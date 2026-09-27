/*
============================================
🎓 Prime OPENALEX CONNECTOR v1
============================================

FEATURES:

✅ Academic Search
✅ Research Papers
✅ Authors
✅ Citations
✅ Clean Results
✅ Error Protection

============================================
*/


const axios =
require("axios");





const name =
"OpenAlex";









// ========================================
// CLEAN TEXT
// ========================================


function clean(text){


if(!text)

return "";



return String(text)

.replace(/<[^>]*>/g," ")

.replace(/\s+/g," ")

.trim();


}









// ========================================
// SEARCH OPENALEX
// ========================================


async function search(query){



try{



console.log(

"🎓 OpenAlex searching:",

query

);






const response =

await axios.get(

"https://api.openalex.org/works",

{

params:{


search:query,


per_page:3



},



timeout:10000



}

);







const works =

response.data.results || [];







let results=[];







for(const work of works){



const title =

clean(

work.title

);





const abstract =

work.abstract_inverted_index

?

Object.keys(

work.abstract_inverted_index

)

.join(" ")

:

"";








let text =

abstract;







if(!text){


text =

`${title}. This is an academic research work published in ${work.publication_year || "unknown year"}.`;

}



if(text.length>30){



results.push({



source:"OpenAlex",



title:title,



text:text,



url:

work.doi || work.id || null



});



}



}








return results;



}

catch(error){



console.log(

"❌ OpenAlex error:",

error.message

);



return [];



}



}









module.exports={


name,


search


};