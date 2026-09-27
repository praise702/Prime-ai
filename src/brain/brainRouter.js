// ============================================
// Prime Brain Router v2
// Decides the correct AI path
// ============================================


const knowledgeManager =
require("../knowledge/knowledgeManager");





function analyzeQuestion(question){


    const text =
    question.toLowerCase().trim();





    // ================================
    // GREETING
    // ================================

    const greetings = [

        "hi",
        "hello",
        "hey",
        "hai",
        "good morning",
        "good evening",
        "good afternoon"

    ];



    if(
        greetings.includes(text)
    ){

        return {

            route:"direct",

            reason:
            "Greeting detected"

        };

    }







    // ================================
    // MATH DETECTION
    // ================================


    const mathPattern =
    /^[0-9\s\+\-\*\/\(\)\.]+$/;



    if(
        mathPattern.test(text)
    ){

        return {

            route:"calculator",

            reason:
            "Mathematical expression detected"

        };

    }






    // ================================
    // LIVE SEARCH KEYWORDS
    // ================================


    const liveKeywords = [


        "latest",
        "today",
        "current",
        "news",
        "recent",
        "price",
        "cost",
        "weather",
        "score",
        "match",
        "release",
        "update",
        "now"


    ];




    for(
        const word of liveKeywords
    ){


        if(
            text.includes(word)
        ){

            return {


                route:"search-engine",


                reason:
                `Live information keyword detected: ${word}`


            };


        }


    }








    // ================================
    // KNOWLEDGE SEARCH
    // ================================


    const results =

    knowledgeManager.searchKnowledge(

        question

    );






    if(
        results &&
        results.length > 0
    ){

        return {


            route:"knowledge-engine",


            reason:
            "Answer found in Prime knowledge database",


            results


        };


    }









    // ================================
    // GENERAL QUESTION
    // ================================


    return {


        route:"knowledge-engine",


        reason:
        "General question sent to AI reasoning system",


        results:[]


    };


}








module.exports = {


    analyzeQuestion


};