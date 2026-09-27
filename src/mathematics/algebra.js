/*
========================================
🚀 Prime Algebra Engine v1
========================================

Solves simple linear equations.

Examples:

x+5=10
2x=20
3x+5=20

========================================
*/


function solveEquation(equation){


    equation =
    equation
    .toLowerCase()
    .replace(/\s/g,"")
    .replace(
        "solve",
        ""
    );




    let parts =
    equation.split("=");



    if(parts.length !== 2){

        return null;

    }



    let left =
    parts[0];


    let right =
    Number(parts[1]);



    if(
        Number.isNaN(right)
    ){

        return null;

    }






    // x + number


    let plus =
    left.match(
        /^x\+(\d+)$/
    );


    if(plus){


        return {

            variable:"x",

            value:
            right -
            Number(plus[1])

        };

    }








    // x - number


    let minus =
    left.match(
        /^x-(\d+)$/
    );


    if(minus){


        return {

            variable:"x",

            value:
            right +
            Number(minus[1])

        };


    }









    // number x + number


    let linear =
    left.match(
    /^(\d+)x\+(\d+)$/
    );



    if(linear){


        let a =
        Number(linear[1]);


        let b =
        Number(linear[2]);



        return {

            variable:"x",

            value:
            (right-b)/a

        };


    }









    // number x


    let multiply =
    left.match(
    /^(\d+)x$/
    );



    if(multiply){


        return {


            variable:"x",

            value:
            right /
            Number(multiply[1])


        };


    }






    return null;


}




module.exports={

solveEquation

};