/**
 * ============================================
 * Prime SMART RESPONSE ENGINE v6
 * Human Style Answer Generator
 * ============================================
 */


function cleanText(text){

    if(!text)
        return "";

    return String(text)
        .replace(/\s+/g," ")
        .trim();

}




function normalizeFacts(data){

    if(Array.isArray(data))
        return data;


    if(data?.facts)
        return data.facts;


    return [];

}




function removeDuplicates(facts){

    const seen=new Set();


    return facts.filter(item=>{


        const text =
        cleanText(
            item.fact ||
            item.answer ||
            ""
        )
        .toLowerCase();



        if(!text)
            return false;



        if(seen.has(text))
            return false;



        seen.add(text);

        return true;


    });

}





function detectStyle(question){


    const q =
    question.toLowerCase();


    if(
        q.includes("compare") ||
        q.includes("difference")
    )
        return "comparison";


    if(
        q.includes("how") ||
        q.includes("why") ||
        q.includes("explain")
    )
        return "explanation";


    return "definition";

}





function createOpening(style){


    if(style==="definition")
        return "";


    if(style==="explanation")
        return "Let's understand this step by step.\n\n";


    if(style==="comparison")
        return "Here is the comparison:\n\n";


    return "";

}





function createAnswer(facts,style){


    let output="";


    if(style==="definition"){


        output += facts[0]+"\n\n";


        if(facts.length>1){

            output +=
            "Related concepts:\n\n";

            for(
                let i=1;
                i<facts.length;
                i++
            ){

                output +=
                `${i}. ${facts[i]}\n`;

            }

        }


    }



    else{


        facts.forEach(
            (fact,index)=>{


                output +=
                `${index+1}. ${fact}\n\n`;


            }
        );


    }


    return output.trim();

}





function generateAnswer(
    knowledge,
    question="",
    reasoning=null
){


    console.log(
        "\n🧠 Prime RESPONSE ENGINE v6"
    );


    let facts =
    normalizeFacts(
        knowledge
    );



    facts =
    removeDuplicates(
        facts
    );



    facts.sort(
        (a,b)=>
        (b.importance||0)
        -
        (a.importance||0)
    );



    facts =
    facts.slice(0,5);



    const textFacts =
    facts.map(item=>
        cleanText(
            item.fact ||
            item.answer
        )
    );



    if(textFacts.length===0){

        return {

            answer:
            "I don't have enough knowledge about this yet.",

            confidence:0,

            factsUsed:0

        };

    }




    const style =
    detectStyle(question);



    console.log(
        "🧠 RESPONSE STYLE:",
        style
    );



    const answer =

    createOpening(style)

    +

    createAnswer(
        textFacts,
        style
    );



    return {


        answer,


        confidence:
        Math.min(
            95,
            facts.length*20
        ),


        factsUsed:
        facts.length,


        style

    };


}





module.exports={
    generateAnswer
};