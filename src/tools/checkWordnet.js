const wordnetEngine = require("../dictionary/wordnetEngine");

async function check(){

    const word = "anandrarious";

    try{

        const result = await wordnetEngine.searchWord(word);

        console.log("FOUND:");
        console.log(result);

    }
    catch(error){

        console.log("NOT FOUND:");
        console.log(error.message);

    }

}

check();