/**
 * ============================================
 * 🚀 Prime RELEVANCE ENGINE v4
 * ============================================
 *
 * Entity locked ranking
 *
 * ============================================
 */


function normalize(text){

    return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g,"")
    .trim();

}





function rankResults(query,results){


    const cleanQuery =
    normalize(query);



    let ranked = results.map(item=>{


        const title =
        normalize(item.title);



        let score = 0;




        // EXACT PAGE MATCH
        if(title === cleanQuery){

            score = 1000;

        }

        else{


            const queryWords =
            cleanQuery.split(" ");


            queryWords.forEach(word=>{


                if(title.includes(word)){

                    score += 10;

                }


            });





            // Description match

            if(
                normalize(item.text)
                .includes(cleanQuery)
            ){

                score +=20;

            }



        }






        // Remove sub topics

        const blocked=[

            "family",

            "son",

            "daughter",

            "college",

            "school",

            "political views",

            "religious views",

            "award",

            "list"

        ];



        blocked.forEach(word=>{


            if(title.includes(word)){

                score -=500;

            }


        });






        // Names with extra words

        if(
            title !== cleanQuery &&
            title.includes(cleanQuery)
        ){

            score -=300;

        }






        return {

            ...item,

            score

        };



    });






    return ranked

    .sort(
        (a,b)=>
        b.score-a.score
    )

    .filter(
        item=>
        item.score>0
    )

    .slice(0,3);



}






module.exports={

rankResults

};