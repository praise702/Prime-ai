const wordnetEngine =
require("../dictionary/wordnetEngine");


async function test(){


const result =
await wordnetEngine.searchWord("grass");


console.log(
JSON.stringify(
result,
null,
2
)
);


}


test();