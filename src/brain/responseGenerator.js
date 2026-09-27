/**
 * =========================================================
 * Prime RESPONSE GENERATOR v6
 *
 * Intelligent answer construction engine
 *
 * Features:
 * - Fact filtering
 * - Duplicate removal
 * - Question understanding
 * - Natural formatting
 * - Multi-topic support
 * - Confidence scoring
 *
 * =========================================================
 */


const { planAnswer } = require("./answerPlanner");



// =========================================================
// Remove duplicate facts
// =========================================================


function removeDuplicates(results){


    const seen = new Set();


    return results.filter(item=>{


        if(
            !item ||
            !item.fact ||
            !item.fact.answer
        ){
            return false;
        }



        const text =
        item.fact.answer
        .toLowerCase()
        .replace(/\s+/g," ")
        .trim();



        if(seen.has(text)){
            return false;
        }



        seen.add(text);


        return true;


    });


}





// =========================================================
// Select useful facts
// =========================================================


function selectBestFacts(
    results,
    limit = 5
){


    let clean =
    removeDuplicates(results);



    return clean
    .sort(
        (a,b)=>
        (b.score||0)
        -
        (a.score||0)
    )
    .slice(0,limit);


}





// =========================================================
// Detect question type
// =========================================================


function detectQuestionType(question){


    const q =
    question.toLowerCase();



    if(
        q.includes("what is") ||
        q.includes("define") ||
        q.includes("meaning")
    ){

        return "definition";

    }



    if(
        q.includes("how")
    ){

        return "explanation";

    }



    if(
        q.includes("why")
    ){

        return "reason";

    }



    if(
        q.includes("difference") ||
        q.includes("compare")
    ){

        return "comparison";

    }



    if(
        q.includes("advantages") ||
        q.includes("benefits")
    ){

        return "advantages";

    }



    if(
        q.includes("example")
    ){

        return "examples";

    }



    return "general";


}





// =========================================================
// Create answer opening
// =========================================================


function createOpening(type){


    switch(type){


        case "definition":

            return " ";


        case "explanation":

            return "Here is how it works:\n\n";


        case "reason":

            return "The reason is:\n\n";


        case "comparison":

            return "Here is the comparison:\n\n";


        case "advantages":

            return "The main advantages are:\n\n";


        case "examples":

            return "Some examples are:\n\n";


        default:

            return "";

    }


}







// =========================================================
// Format facts
// =========================================================


function formatFacts(
    facts,
    type
){


    let output=[];



    for(
        const item of facts
    ){


        let text =
        item.fact.answer.trim();



        if(
            type==="general" ||
            type==="comparison" ||
            type==="advantages"
        ){

            output.push(
                "• " + text
            );

        }

        else{

            output.push(
                text
            );

        }



    }



    return output.join("\n\n");


}






// =========================================================
// Confidence calculation
// =========================================================


function calculateConfidence(
    facts
){


    if(
        !facts ||
        facts.length===0
    ){

        return 0;

    }



    let score =
    facts[0].score || 0;



    let confidence =
    Math.round(
        score
        *
        100
        /
        120
    );



    if(confidence>95)
        confidence=95;



    if(confidence<20)
        confidence=20;



    return confidence;


}







// =========================================================
// MAIN GENERATOR
// =========================================================


function generateResponse(
    question,
    rankedFacts
){



    if(
        !rankedFacts ||
        rankedFacts.length===0
    ){


        return {


            answer:
            "I do not have enough information about this topic yet. You can teach me and I will remember it.",


            confidence:0,


            factsUsed:0,


            sources:[]


        };


    }





    let selected =

    selectBestFacts(
        rankedFacts,
        5
    );





    selected =

    planAnswer(
        selected,
        question
    );







    const type =

    detectQuestionType(
        question
    );







    let answer =

    createOpening(type)

    +

    formatFacts(
        selected,
        type
    );







    answer =

    answer
    .replace(
        /\n{3,}/g,
        "\n\n"
    )
    .trim();








    return {


        answer,


        confidence:

        calculateConfidence(
            selected
        ),



        factsUsed:

        selected.length,



        sources:

        selected.map(
            x=>x.fact.id
        )



    };

}






module.exports={

    generateResponse

};