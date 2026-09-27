const wordnetEngine =
require("../dictionary/wordnetEngine");


async function run(){

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


run();