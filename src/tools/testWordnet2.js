const wordnet =
require("../dictionary/wordnetEngine");


async function test(){


let result =
await wordnet.searchWord("grass");


console.log(result);


}


test();