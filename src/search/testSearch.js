const searchManager =
require("./searchManager");


async function test(){


    console.log("\n🚀 Prime SEARCH TEST\n");


    const result =

    await searchManager.searchKnowledge(
        "Albert Einstein"
    );


    console.log("\nFINAL RESULTS:\n");


    console.log(result);


}


test();