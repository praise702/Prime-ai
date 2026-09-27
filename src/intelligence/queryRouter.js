/*
============================================
🧠 Prime QUERY ROUTER v1
============================================

FEATURES:

✅ Question understanding
✅ Identity detection
✅ Creator questions
✅ Dictionary protection
✅ Knowledge routing
✅ Explanation routing
✅ Math routing

============================================
*/


function route(message){


    const text =
    message
    .toLowerCase()
    .trim();




    // ========================================
    // GREETING
    // ========================================

    if(
        /^(hi|hello|hey|hai|hii)\b/.test(text)
    ){

        return {

            type:"GREETING",

            confidence:100

        };

    }






    // ========================================
    // MATH
    // ========================================

    if(

        /\d/.test(text)

        &&

        /(\+|\-|\*|\/|multiply|divide|plus|minus|times|square|root)/.test(text)

    ){

        return {

            type:"MATH",

            confidence:95

        };

    }







    // ========================================
    // Prime IDENTITY
    // ========================================

    if(

        (text.includes("prime") || text.includes("prime ai"))

        &&

        (

        text.includes("developed")
        ||
        text.includes("created")
        ||
        text.includes("made")
        ||
        text.includes("built")

        )

    ){

        return {

            type:"PRIME_IDENTITY",

            confidence:100

        };

    }







    // ========================================
    // CREATOR QUESTIONS
    // ========================================

    if(

        (

        text.includes("who developed")
        ||
        text.includes("who created")
        ||
        text.includes("who made")
        ||
        text.includes("who invented")

        )

    ){

        return {

            type:"CREATOR",

            confidence:95

        };

    }








    // ========================================
    // KNOWLEDGE COMMAND
    // ========================================

    if(

        text.includes("what knowledge")

        ||

        text.includes("what do you know")

        ||

        text.includes("your knowledge")

    ){

        return {

            type:"KNOWLEDGE_LIST",

            confidence:100

        };

    }








    // ========================================
    // EXPLANATION
    // ========================================

    if(

        text.includes("explain")

        ||

        text.includes("how does")

        ||

        text.includes("how do")

        ||

        text.includes("why")

    ){

        return {

            type:"EXPLANATION",

            confidence:90

        };

    }








    // ========================================
    // DEFINITION
    // ========================================

    if(

        text.startsWith("what is")

        ||

        text.startsWith("define")

        ||

        text.startsWith("meaning of")

    ){

        return {

            type:"DEFINITION",

            confidence:90

        };

    }








    // ========================================
    // GENERAL
    // ========================================


    return {

        type:"GENERAL",

        confidence:50

    };


}






module.exports={

    route

};