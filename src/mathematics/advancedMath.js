/*
========================================
🚀 Prime Advanced Mathematics v2
========================================
*/


// Percentage

function percentage(value, percent){

    return (value * percent) / 100;

}





// Fraction operations


function fractionToDecimal(numerator, denominator){

    if(denominator === 0)
        return null;

    return numerator / denominator;

}





function addFractions(a,b,c,d){

    return (
        (a*d)+(b*c)
    ) / 
    (b*d);

}





function subtractFractions(a,b,c,d){

    return (
        (a*d)-(b*c)
    ) /
    (b*d);

}





function multiplyFractions(a,b,c,d){

    return (
        a*c
    ) /
    (
        b*d
    );

}





function divideFractions(a,b,c,d){

    if(c===0)
        return null;


    return (
        a*d
    ) /
    (
        b*c
    );

}








// Decimal to fraction


function decimalToFraction(decimal){


    let tolerance = 1e-10;

    let numerator = 1;

    let denominator = 1;



    while(
        Math.abs(
            decimal -
            numerator/denominator
        )
        >
        tolerance
    ){


        if(
            numerator/denominator
            <
            decimal
        ){

            numerator++;

        }

        else{

            denominator++;

        }


    }



    return simplifyFraction(
        numerator,
        denominator
    );

}





function simplifyFraction(
    numerator,
    denominator
){


    function gcd(a,b){

        while(b){

            let temp=b;

            b=a%b;

            a=temp;

        }

        return a;

    }



    let g =
    gcd(
        numerator,
        denominator
    );



    return {

        numerator:
        numerator/g,


        denominator:
        denominator/g

    };


}







module.exports={


percentage,

fractionToDecimal,

addFractions,

subtractFractions,

multiplyFractions,

divideFractions,

decimalToFraction,

simplifyFraction


};