/*
================================================
🧠 Prime ANSWER FORMATTER v4.0
================================================

FEATURES:

✅ Removes web garbage
✅ Removes source names
✅ Removes URLs
✅ Removes citations
✅ Removes repeated facts
✅ Fixes bad spacing
✅ Creates natural AI answers
✅ Keeps important information
✅ Hides internal provider names
================================================
*/


function cleanText(text){

    if(!text)
        return "";

    return String(text)

    // remove html
    .replace(/<[^>]*>/g," ")

    // remove citations
    .replace(/\[[0-9]+\]/g,"")

    // remove urls
    .replace(/https?:\/\/\S+/gi,"")

    // remove wikipedia junk
    .replace(/\/.*?\//g," ")

    // remove source words
    .replace(
        /\b(Wikipedia|Google|Bing|OpenAlex|arXiv)\b/gi,
        ""
    )

    // remove symbols
    .replace(/[•●]/g," ")

    // spaces
    .replace(/\s+/g," ")

    .trim();

}




function splitSentences(text){

    return text

    .split(/(?<=[.!?])\s+/)

    .map(x=>x.trim())

    .filter(x=>x.length>20);

}




function removeDuplicates(sentences){

    const used=new Set();


    return sentences.filter(sentence=>{


        const key =
        sentence
        .toLowerCase()
        .replace(/\W/g,"")
        .substring(0,100);



        if(used.has(key))
            return false;


        used.add(key);

        return true;


    });


}





function rankImportance(sentences){


    const keywords=[

        "president",
        "chief minister",
        "born",
        "created",
        "developed",
        "served",
        "known",
        "leader",
        "scientist",
        "engineer",
        "located"

    ];



    return sentences.sort((a,b)=>{


        let A=0;
        let B=0;



        keywords.forEach(word=>{


            if(a.toLowerCase().includes(word))
                A++;


            if(b.toLowerCase().includes(word))
                B++;


        });



        return B-A;


    });


}





function hideWrongInformation(sentences,query){


    const q=query.toLowerCase();



    return sentences.filter(sentence=>{


        const s=sentence.toLowerCase();



        // remove unrelated AI knowledge
        if(
            (
            q.includes("chief minister")
            ||
            q.includes("cm")
            )
            &&
            (
            s.includes("artificial intelligence")
            ||
            s.includes("machine learning")
            )
        ){

            return false;

        }



        return true;


    });


}





function createAnswer(query,results){



    if(!results || results.length===0){


        return {

            answer:
            "I could not find enough information about this topic.",

            confidence:0

        };


    }





    let combined="";



    results.forEach(item=>{


        combined += " "+

        cleanText(

            item.text ||

            item.content ||

            ""

        );


    });






    let sentences =

    splitSentences(combined);




    sentences =

    removeDuplicates(sentences);




    sentences =

    hideWrongInformation(

        sentences,

        query

    );




    sentences =

    rankImportance(sentences);






    let answer="";



    answer +=

    sentences

    .slice(0,6)

    .join(" ");





    return {


        answer,


        confidence:

        Math.min(

            95,

            results.length*25

        )


    };


}






module.exports={

createAnswer

};