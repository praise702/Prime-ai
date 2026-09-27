/**
 * ============================================
 * 🚀 Prime FACT EXTRACTOR v5
 * ============================================
 *
 * Converts raw knowledge into AI-ready facts
 *
 * Features:
 * - Sentence intelligence
 * - Importance ranking
 * - Duplicate removal
 * - Famous fact priority
 * - Clean output
 *
 * ============================================
 */



function cleanText(text){


    return String(text || "")

    .replace(/<[^>]*>/g,"")

    .replace(/\s+/g," ")

    .replace(/\s([,.!?])/g,"$1")

    .trim();


}







function normalize(text){


    return cleanText(text)

    .toLowerCase()

    .replace(/[^\w\s]/g,"");


}









function calculateImportance(sentence){



    let score = 2;



    const highValueWords=[


        "born",

        "developed",

        "created",

        "invented",

        "discovered",

        "theory",

        "relativity",

        "equation",

        "nobel",

        "award",

        "famous",

        "known",

        "contribution",

        "achievement"


    ];





    highValueWords.forEach(word=>{


        if(
            sentence
            .toLowerCase()
            .includes(word)
        ){

            score++;

        }


    });






    return Math.min(score,5);



}








function removeDuplicates(facts){



    const used = new Set();




    return facts.filter(item=>{


        const key =

        normalize(item.fact)

        .split(" ")

        .slice(0,8)

        .join(" ");






        if(
            used.has(key)
        ){

            return false;

        }





        used.add(key);



        return true;



    });



}








function extractFacts(results){



    console.log(
        "\n🧠 FACT EXTRACTION v5"
    );





    let facts=[];






    results.forEach(item=>{



        const sentences =

        item.text

        .split(/[.!?]/);






        sentences.forEach(sentence=>{



            sentence =
            cleanText(sentence);






            if(
                sentence.length < 40
            ){

                return;

            }






            facts.push({


                fact:
                sentence + ".",


                topic:
                item.title,


                source:
                item.source,



                importance:
                calculateImportance(
                    sentence
                )


            });



        });



    });









    facts =

    removeDuplicates(
        facts
    );







    facts.sort(
        (a,b)=>

        b.importance -
        a.importance

    );






    console.log(

        "📚 Clean Facts:",

        facts.length

    );






    return {


        facts,


        source:
        "Prime Fact Extractor v5"


    };



}








module.exports={


    extractFacts


};