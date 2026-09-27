/*
========================================
🚀 Prime Math Parser v4
========================================

Understands:

✅ 5+5
✅ 5 multiply by 650
✅ 5 multiplied by 650
✅ what is 20 plus 30
✅ calculate 500 divided by 5
✅ spelling mistakes:
   multipy
   multply
   mulitply
   divied

========================================
*/



function correctMathWords(text){


    const corrections = {


        // multiplication

        "multply":"multiply",
        "multipy":"multiply",
        "mulitply":"multiply",
        "multiplay":"multiply",
        "multiplie":"multiply",


        // division

        "divied":"divide",
        "divde":"divide",
        "dvide":"divide",
        "devide":"divide",


        // subtraction

        "minues":"minus",
        "mnius":"minus",


        // times

        "timse":"times",
        "tims":"times"

    };



    for(
        const wrong in corrections
    ){


        text =
        text.replace(

            new RegExp(
                "\\b"+wrong+"\\b",
                "g"
            ),

            corrections[wrong]

        );


    }



    return text;


}









function clean(text){


    text =
    text.toLowerCase();



    text =
    correctMathWords(text);



    text =
    text.replace(
        /,/g,
        ""
    );



    text =
    text.replace(
        /\?/g,
        ""
    );



    text =
    text.replace(

        /what is|whats|calculate|solve|find|please|tell me|can you|give me/g,

        ""

    );



    return text.trim();


}









function parse(message){



let text =
clean(message);









// ================================
// PERCENTAGE
// ================================


let percent =
text.match(

/(-?\d+(?:\.\d+)?)\s*percent\s*(of)?\s*(-?\d+(?:\.\d+)?)/

);



if(percent){


return {


type:"calculation",


operation:"percentage",


a:Number(percent[3]),


b:Number(percent[1])


};


}









// ================================
// ADDITION
// ================================


let add =
text.match(

/(-?\d+(?:\.\d+)?)\s*(plus|add|added to|\+)\s*(-?\d+(?:\.\d+)?)/

);



if(add){


return {


type:"calculation",


operation:"add",


a:Number(add[1]),


b:Number(add[3])


};


}









// ================================
// SUBTRACTION
// ================================


let subtract =
text.match(

/(-?\d+(?:\.\d+)?)\s*(minus|subtract|take away|-)\s*(-?\d+(?:\.\d+)?)/

);



if(subtract){


return {


type:"calculation",


operation:"subtract",


a:Number(subtract[1]),


b:Number(subtract[3])


};


}









// ================================
// MULTIPLICATION
// ================================


let multiply =
text.match(

/(-?\d+(?:\.\d+)?)\s*(times|multiply|multiply by|multiplied by|x|\*)\s*(-?\d+(?:\.\d+)?)/

);



if(multiply){


return {


type:"calculation",


operation:"multiply",


a:Number(multiply[1]),


b:Number(multiply[3])


};


}









// ================================
// DIVISION
// ================================


let divide =
text.match(

/(-?\d+(?:\.\d+)?)\s*(divide by|divided by|divide|over|\/)\s*(-?\d+(?:\.\d+)?)/

);



if(divide){


return {


type:"calculation",


operation:"divide",


a:Number(divide[1]),


b:Number(divide[3])


};


}









// ================================
// POWER
// ================================


let power =
text.match(

/(-?\d+)\s*(power|raised to)\s*(-?\d+)/

);



if(power){


return {


type:"calculation",


operation:"power",


a:Number(power[1]),


b:Number(power[3])


};


}









// ================================
// SQUARE ROOT
// ================================


let root =
text.match(

/square root\s*(of)?\s*(\d+)/

);



if(root){


return {


type:"calculation",


operation:"sqrt",


a:Number(root[2])


};


}









// ================================
// FRACTION
// ================================


let fraction =
text.match(

/(-?\d+)\s*\/\s*(-?\d+)/

);



if(fraction){


return {


type:"fraction",


numerator:Number(fraction[1]),


denominator:Number(fraction[2])


};


}









// ================================
// ALGEBRA
// ================================


if(

text.includes("x")

&&

text.includes("=")

){


return {


type:"algebra",


equation:text


};


}









// ================================
// NORMAL MATH
// ================================


if(

/^[0-9+\-*/().\s]+$/.test(text)

){


return {


type:"expression",


expression:text


};


}









return null;


}









module.exports={

parse

};