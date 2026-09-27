/*
========================================
Prime Advanced Calculator Tool v2
========================================

Understands:
✅ Normal equations
✅ What is 5+5
✅ Whats 10 times 5
✅ Add numbers
✅ Subtract numbers
✅ Multiply numbers
✅ Divide numbers
✅ Power
✅ Percentage
✅ Square root

========================================
*/


function cleanMessage(message){

    return message
    .toLowerCase()
    .replace(/,/g,"")
    .replace(/\?/g,"")
    .trim();

}






function isMathExpression(message){


    const text =
    cleanMessage(message);



    return (

        /^[0-9+\-*/().\s]+$/.test(text)

        ||

        text.includes("calculate")

        ||

        text.includes("what is")

        ||

        text.includes("whats")

        ||

        text.includes("plus")

        ||

        text.includes("minus")

        ||

        text.includes("times")

        ||

        text.includes("multiply")

        ||

        text.includes("divide")

        ||

        text.includes("square root")

        ||

        text.includes("%")

    );


}









function convertToExpression(message){


let text =
cleanMessage(message);



// Remove common words

text =
text
.replace(
/(what is|whats|calculate|solve|answer|equals|equal to)/g,
""
);





// Addition

text =
text.replace(
/(\d+)\s*(plus|add)\s*(\d+)/g,
"$1+$3"
);




// Subtraction

text =
text.replace(
/(\d+)\s*(minus|subtract)\s*(\d+)/g,
"$1-$3"
);




// Multiplication

text =
text.replace(
/(\d+)\s*(times|multiply|x)\s*(\d+)/g,
"$1*$3"
);




// Division

text =
text.replace(
/(\d+)\s*(divide|divided by|over)\s*(\d+)/g,
"$1/$3"
);




// Percentage

text =
text.replace(
/(\d+)%/g,
"($1/100)"
);




// Square root

if(
text.includes("square root")
){

const number =
text.match(/\d+/);


if(number){

return `Math.sqrt(${number[0]})`;

}

}





return text.trim();


}









function calculate(message){


try{


const expression =
convertToExpression(message);




const result = require("../mathematics/mathEngine").evaluate(expression);





if(

typeof result !== "number"

||

!isFinite(result)

){

return null;

}



return Number(
result.toFixed(10)
);



}

catch(error){


return null;


}


}









module.exports = {


isMathExpression,

calculate


};
