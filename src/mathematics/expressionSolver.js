const mathEngine = require("./mathEngine");

/*
========================================
Prime Smart Expression Solver v2
========================================
*/


function solve(expression){


try{


    expression =
    expression
    .replace(
        /÷/g,
        "/"
    )
    .replace(
        /×/g,
        "*"
    );




    const result = mathEngine.evaluate(expression);




    if(
        typeof result !== "number"
    )
    return null;



    if(
        !Number.isFinite(result)
    )
    return null;



    return Number(
        result.toFixed(10)
    );


}
catch{

    return null;

}


}




module.exports={

solve

};
