const dictionaryEngine =
require("../dictionary/dictionaryEngine");


async function test(){


let result =
await dictionaryEngine.analyze(
"what is grass"
);


console.log(result);


}


test();