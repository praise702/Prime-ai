/*
================================================
🧠 Prime QUERY ANALYZER v1.0
================================================

Features:

✅ Intent detection
✅ Topic detection
✅ Source recommendation
✅ Answer style selection
✅ Priority detection
✅ Keyword extraction

================================================
*/



// ==============================================
// DETECT INTENT
// ==============================================


function detectIntent(query){


    const q=query.toLowerCase();



    if(
        q.includes("who is") ||
        q.includes("biography") ||
        q.includes("born")
    ){

        return "Biography";

    }





    if(
        q.includes("latest") ||
        q.includes("today") ||
        q.includes("news")
    ){

        return "Current Information";

    }







    if(
        q.includes("how") ||
        q.includes("why") ||
        q.includes("explain")
    ){

        return "Explanation";

    }








    if(
        q.includes("code") ||
        q.includes("program") ||
        q.includes("javascript") ||
        q.includes("python")
    ){

        return "Programming";

    }







    if(
        q.includes("research") ||
        q.includes("paper") ||
        q.includes("study")
    ){

        return "Research";

    }





    return "General";

}









// ==============================================
// DETECT TOPIC
// ==============================================


function detectTopic(query){


    const q=query.toLowerCase();



    if(
        q.includes("ai") ||
        q.includes("gpu") ||
        q.includes("computer") ||
        q.includes("technology")
    ){

        return "Technology";

    }




    if(
        q.includes("science") ||
        q.includes("physics") ||
        q.includes("chemistry")
    ){

        return "Science";

    }




    if(
        q.includes("person") ||
        q.includes("who")
    ){

        return "People";

    }




    if(
        q.includes("code") ||
        q.includes("software")
    ){

        return "Programming";

    }



    return "General";

}









// ==============================================
// SOURCE SELECTION
// ==============================================


function recommendSources(intent){



    switch(intent){


        case "Biography":

            return [

                "wikipedia",

                "web-search"

            ];





        case "Research":

            return [

                "arxiv",

                "openalex"

            ];





        case "Programming":

            return [

                "web-search",

                "wikibooks"

            ];





        case "Current Information":

            return [

                "web-search"

            ];





        default:

            return [

                "wikipedia",

                "web-search"

            ];


    }


}









// ==============================================
// ANSWER STYLE
// ==============================================


function answerStyle(intent){



    if(intent==="Biography")

        return "Summary + Timeline";



    if(intent==="Research")

        return "Detailed Analysis";



    if(intent==="Programming")

        return "Step by Step Guide";



    if(intent==="Explanation")

        return "Simple Explanation";




    return "Normal Answer";


}









// ==============================================
// PRIORITY
// ==============================================


function priority(query){



    const q=query.toLowerCase();




    if(
        q.includes("latest") ||
        q.includes("urgent") ||
        q.includes("today")
    )

        return "High";



    return "Normal";


}









// ==============================================
// KEYWORD EXTRACTION
// ==============================================


function keywords(query){


    return query

    .replace(/[^\w\s]/g,"")

    .split(" ")

    .filter(word=>word.length>3);


}









// ==============================================
// MAIN ANALYZER
// ==============================================


function analyzeQuery(query){



    const intent=

    detectIntent(query);





    return {


        query,


        intent,


        topic:

        detectTopic(query),



        sources:

        recommendSources(intent),



        style:

        answerStyle(intent),



        priority:

        priority(query),



        keywords:

        keywords(query)



    };


}









module.exports={


    analyzeQuery,

    detectIntent,

    detectTopic


};