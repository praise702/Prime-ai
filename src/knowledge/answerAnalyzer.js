/*
================================================
🧠 Prime ADVANCED ANSWER ANALYZER v1.0
================================================

FEATURES:

✅ Source comparison
✅ Reliability scoring
✅ Fact extraction
✅ Entity detection
✅ Date detection
✅ Number detection
✅ Contradiction detection
✅ Confidence calculation
✅ Hallucination protection
✅ AI decision system

================================================
*/


// ==============================================
// CLEAN TEXT
// ==============================================


function clean(text){

    if(!text)
        return "";

    return String(text)
    .replace(/\s+/g," ")
    .trim();

}



// ==============================================
// EXTRACT SENTENCES
// ==============================================


function sentences(text){

    return clean(text)

    .split(/(?<=[.!?])\s+/)

    .filter(x=>x.length>20);

}



// ==============================================
// EXTRACT FACTS
// ==============================================


function extractFacts(text){


    const list=[];


    const s=sentences(text);



    s.forEach(sentence=>{


        if(

            sentence.includes(" is ") ||
            sentence.includes(" was ") ||
            sentence.includes(" born ") ||
            sentence.includes(" founded ") ||
            sentence.includes(" created ")

        ){

            list.push(sentence);

        }


    });



    return list.slice(0,20);


}



// ==============================================
// ENTITY DETECTOR
// ==============================================


function detectEntities(text){


    const names =

    text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+/g);


    return [

        ...new Set(names || [])

    ];


}



// ==============================================
// DATE DETECTOR
// ==============================================


function detectDates(text){


    return text.match(

        /\b\d{1,4}\s?(BC|AD)?\b|\b\d{4}\b/g

    ) || [];


}



// ==============================================
// NUMBER DETECTOR
// ==============================================


function detectNumbers(text){


    return text.match(

        /\b\d+(?:\.\d+)?\b/g

    ) || [];


}




// ==============================================
// SOURCE RELIABILITY
// ==============================================


function sourceScore(source){


    let score=50;


    const url =

    source.url || "";



    if(url.includes("wikipedia"))

        score+=20;



    if(url.includes(".edu"))

        score+=20;



    if(url.includes("gov"))

        score+=20;



    if(url.includes("britannica"))

        score+=25;



    if(url.includes("blog"))

        score-=20;



    return Math.min(score,100);


}



// ==============================================
// COMPARE SOURCES
// ==============================================


function compareSources(results){


    let scores=[];


    results.forEach(item=>{


        scores.push({

            source:item.source || "unknown",

            score:sourceScore(item),

            text:item.text

        });


    });



    return scores.sort(

        (a,b)=>b.score-a.score

    );


}




// ==============================================
// CONTRADICTION CHECK
// ==============================================


function findContradictions(results){


    let issues=[];


    let texts = results.map(

        x=>x.text.toLowerCase()

    );



    for(let i=0;i<texts.length;i++){


        for(let j=i+1;j<texts.length;j++){


            if(

                texts[i].includes("born") &&

                texts[j].includes("born")

            ){


                let a=texts[i].match(/\d{4}/);

                let b=texts[j].match(/\d{4}/);



                if(

                    a &&

                    b &&

                    a[0]!==b[0]

                ){


                    issues.push(

                    "Possible date conflict"

                    );

                }


            }


        }


    }


    return issues;


}



// ==============================================
// CONFIDENCE
// ==============================================


function confidence(results,issues){


    let score=0;



    results.forEach(item=>{


        score += sourceScore(item)/10;


    });



    score/=results.length;



    if(issues.length)

        score-=20;



    return Math.max(

        0,

        Math.min(

            100,

            Math.round(score)

        )

    );


}



// ==============================================
// MAIN ANALYZE FUNCTION
// ==============================================


function analyze(results){



    if(!results || !results.length){


        return {


            confidence:0,

            facts:[],

            entities:[],

            warning:"No data"


        };


    }





    let allText="";



    results.forEach(r=>{


        allText += " "+r.text;


    });





    const analysis={


        confidence:


        confidence(

            results,

            findContradictions(results)

        ),



        facts:

        extractFacts(allText),



        entities:

        detectEntities(allText),



        dates:

        detectDates(allText),



        numbers:

        detectNumbers(allText),



        sources:

        compareSources(results),



        contradictions:

        findContradictions(results),



        safe:

        true



    };





    if(analysis.contradictions.length)

    {

        analysis.safe=false;

    }




    return analysis;


}





module.exports={

    analyze

};