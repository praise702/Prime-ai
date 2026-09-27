/**
 * ============================================
 * Prime KNOWLEDGE FUSION ENGINE v2
 * ============================================
 *
 * Combines:
 * - Internal Prime knowledge
 * - External web knowledge
 * - Wikipedia facts
 *
 * Creates one unified knowledge layer.
 *
 * ============================================
 */





console.log(
    "\n🧠 KNOWLEDGE FUSION MODULE LOADED"
);







// Convert any fact format into text

function extractFact(item){


    if(!item)
        return "";



    // String format

    if(typeof item.fact === "string"){

        return item.fact;

    }



    // Object format

    if(
        typeof item.fact === "object" &&
        item.fact.answer
    ){

        return item.fact.answer;

    }



    // Direct answer

    if(item.answer){

        return item.answer;

    }



    return "";

}








// Clean text

function cleanText(text){


    if(!text)
        return "";


    return text
    .replace(/\s+/g," ")
    .trim();


}









// Normalize for duplicate checking

function normalize(text){


    return cleanText(text)
    .toLowerCase()
    .replace(/[^\w\s]/g,"");

}









// Remove duplicate knowledge

function removeDuplicates(facts){


    const seen =
    new Set();



    return facts.filter(item=>{


        const text =
        normalize(
            extractFact(item)
        );



        if(!text)
            return false;



        const key =
        text
        .split(" ")
        .slice(0,8)
        .join(" ");




        if(seen.has(key)){

            return false;

        }



        seen.add(key);



        return true;



    });



}









// Add default metadata

function formatFact(item){



    const fact =
    cleanText(
        extractFact(item)
    );



    return {


        fact,


        topic:
        item.topic ||
        "general",



        source:
        item.source ||
        "Prime Knowledge",



        importance:
        item.importance ||
        3



    };


}











// Main Fusion Function


function fuseKnowledge(

    localKnowledge = [],

    webKnowledge = []

){



    console.log(
        "\n🧠 KNOWLEDGE FUSION STARTED"
    );





    let combined = [

        ...localKnowledge,

        ...webKnowledge

    ];







    console.log(

        "RAW FACTS:",
        combined.length

    );







    // Remove invalid facts

    combined =
    combined.filter(item=>{


        return extractFact(item)
        .length > 0;


    });








    // Convert formats

    combined =
    combined.map(
        formatFact
    );








    // Remove duplicates

    combined =
    removeDuplicates(
        combined
    );








    // Rank importance

    combined.sort(

        (a,b)=>

        b.importance -
        a.importance

    );








    console.log(

        "🧠 FUSED FACTS:",
        combined.length

    );








    return combined;



}









module.exports = {


    fuseKnowledge


};