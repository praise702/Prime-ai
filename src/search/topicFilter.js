/**
 * ============================================
 * 🚀 Prime TOPIC FILTER v1
 * ============================================
 *
 * Keeps only facts related to the main entity
 *
 * ============================================
 */


function normalize(text){

    return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g,"")
    .trim();

}




function filterFacts(query,facts){


    const mainTopic =
    normalize(query);



    const words =
    mainTopic.split(" ");




    return facts.filter(item=>{


        const topic =
        normalize(item.topic);



        let matches=0;



        words.forEach(word=>{


            if(topic.includes(word)){

                matches++;

            }


        });




        return matches >= words.length;


    });



}




module.exports={

    filterFacts

};