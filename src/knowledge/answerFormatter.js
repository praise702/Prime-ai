/*
================================================
🧠 Prime ADVANCED ANSWER FORMATTER v4.0
================================================

FEATURES:

✅ Smart text cleaning
✅ Search garbage removal
✅ Duplicate removal
✅ Sentence ranking
✅ Important fact extraction
✅ Query type detection
✅ Summary generation
✅ Bullet generation
✅ Source handling
✅ Confidence calculation
✅ AI-ready output
✅ RAG compatible structure

================================================
*/



// ==============================================
// TEXT CLEANER
// ==============================================


function cleanText(text){


    if(!text)

        return "";



    return String(text)

    .replace(/<[^>]*>/g," ")

    .replace(/\[[0-9]+\]/g,"")

    .replace(/\([^)]*source[^)]*\)/gi,"")

    .replace(/https?:\/\/\S+/g,"")

    .replace(/&[a-z]+;/gi," ")

    .replace(/\s+/g," ")

    .trim();


}





// ==============================================
// REMOVE SEARCH GARBAGE
// ==============================================


function removeGarbage(text){


    const garbage=[


        "click here",

        "read more",

        "learn more",

        "subscribe",

        "sign up",

        "cookie",

        "privacy policy",

        "advertisement",

        "javascript",

        "enable cookies",

        "all rights reserved"


    ];



    let clean=text;



    garbage.forEach(word=>{


        clean = clean.replace(

            new RegExp(word,"gi"),

            ""

        );


    });



    return clean.trim();


}







// ==============================================
// SPLIT SENTENCES
// ==============================================


function splitSentences(text){


    return text

    .split(/(?<=[.!?])\s+/)

    .map(x=>x.trim())

    .filter(x=>x.length>25);


}







// ==============================================
// REMOVE DUPLICATES
// ==============================================


function removeDuplicates(sentences){


    const used=new Set();



    return sentences.filter(sentence=>{


        const key=

        sentence

        .toLowerCase()

        .substring(0,90);



        if(used.has(key))

            return false;



        used.add(key);



        return true;


    });


}








// ==============================================
// SENTENCE IMPORTANCE RANKING
// ==============================================


function rankSentences(sentences){


    const keywords=[


        "is",

        "was",

        "born",

        "created",

        "developed",

        "known",

        "served",

        "founded",

        "released",

        "invented",

        "important",

        "works",

        "uses",

        "called"



    ];





    return sentences.sort((a,b)=>{


        let scoreA=0;

        let scoreB=0;



        keywords.forEach(word=>{


            if(a.toLowerCase().includes(word))

                scoreA++;



            if(b.toLowerCase().includes(word))

                scoreB++;



        });



        return scoreB-scoreA;


    });



}








// ==============================================
// QUERY TYPE DETECTION
// ==============================================


function detectType(query){


    const q=query.toLowerCase();




    if(

        q.includes("who") ||

        q.includes("biography") ||

        q.includes("person")

    )

        return "Biography";






    if(

        q.includes("latest") ||

        q.includes("today") ||

        q.includes("news")

    )

        return "Current Information";






    if(

        q.includes("gpu") ||

        q.includes("cpu") ||

        q.includes("computer") ||

        q.includes("ai") ||

        q.includes("technology")

    )

        return "Technology";






    if(

        q.includes("how") ||

        q.includes("learn")

    )

        return "Explanation";






    return "General Knowledge";


}









// ==============================================
// SUMMARY CREATOR
// ==============================================


function createSummary(sentences){


    let summary =


    sentences

    .slice(0,5)

    .join(" ");




    if(summary.length>800){


        summary=

        summary.substring(0,800)

        +"...";


    }



    return summary;


}








// ==============================================
// BULLET CREATOR
// ==============================================


function createBullets(sentences){


    return sentences

    .slice(0,6)

    .map(sentence=>{


        return `• ${sentence}`;


    })

    .join("\n");


}









// ==============================================
// IMPORTANT FACT EXTRACTION
// ==============================================


function extractFacts(sentences){


    let facts=[];




    sentences.forEach(sentence=>{


        if(

            /\b(19|20)\d{2}\b/.test(sentence)

            ||

            /\b\d+\b/.test(sentence)

        ){


            facts.push(sentence);


        }



    });




    return facts.slice(0,5);


}









// ==============================================
// SOURCE FORMATTER
// ==============================================


function formatSources(results){


    if(!results.length)

        return "No sources";




    return results

    .slice(0,5)

    .map((item,index)=>{


        return (

        `${index+1}. ${item.source || "Web"}`
        
        );


    })

    .join("\n");


}









// ==============================================
// CONFIDENCE SYSTEM
// ==============================================


function calculateConfidence(results){


    if(!results.length)

        return 0;




    let score=0;




    results.forEach(item=>{


        if(item.title)

            score+=15;



        if(item.url)

            score+=15;



        if(

            item.text &&

            item.text.length>200

        )

            score+=20;



    });





    return Math.min(

        100,

        score

    );


}









// ==============================================
// MAIN FORMAT FUNCTION
// ==============================================


function formatAnswer(query,results){



    if(

        !results ||

        results.length===0

    ){



        return {


            answer:

            `I could not find information about ${query}.`,


            confidence:0


        };


    }








    let combined="";





    results.forEach(item=>{


        combined +=

        " "+

        cleanText(item.text);



    });







    combined=

    removeGarbage(combined);









    let sentences=

    splitSentences(combined);






    sentences=

    removeDuplicates(sentences);








    sentences=

    rankSentences(sentences);









    let response="";






    response +=

`# ${query}

`;





    response +=

`Category: ${detectType(query)}

\n`;







    response +=

createSummary(sentences);









    response +=

`

## Key Points

`;






    response +=

createBullets(sentences);









    let facts=

    extractFacts(sentences);





    if(facts.length){


        response +=

`

## Important Facts

`;



        response +=

        facts

        .map(x=>"• "+x)

        .join("\n");


    }











    response +=

`

## Sources

`;





    response +=

    formatSources(results);









    response +=

`

## AI Confidence

`;





    response +=

    calculateConfidence(results)

    +"%";









    return {


        answer:response,


        confidence:

        calculateConfidence(results),



        type:

        detectType(query)



    };


}









module.exports={


    formatAnswer,

    detectType,

    extractFacts,

    calculateConfidence


};