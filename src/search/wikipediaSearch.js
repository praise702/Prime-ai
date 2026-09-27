const axios = require("axios");


async function searchWikipedia(query){

    console.log("\n🌐 WIKIPEDIA SEARCH");
    console.log("Query:", query);


    try{

        const response = await axios.get(
            "https://en.wikipedia.org/w/api.php",
            {
                params:{
                    action:"query",
                    generator:"search",
                    gsrsearch:query,
                    gsrlimit:10,
                    prop:"extracts",
                    exintro:true,
                    explaintext:true,
                    format:"json"
                },

                headers:{
                    "User-Agent":"Prime"
                }
            }
        );


        const pages =
        response.data.query?.pages;


        if(!pages){

            return [];

        }



        return Object.values(pages).map(page=>({

            title:page.title,

            text:
            page.extract || "",

            source:"wikipedia"

        }));



    }

    catch(error){

        console.log(
            "Wikipedia Error:",
            error.message
        );


        return [];

    }


}



module.exports={
    searchWikipedia
};