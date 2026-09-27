const searchEngine =
require("./searchEngine");

const processor =
require("./webProcessor");


async function test(){


    console.log("\n🚀 Prime WEB PROCESSOR TEST\n");


    const searchResult =
    await searchEngine.search(
        "Albert Einstein"
    );


    const processed =
    processor.processWebResult(
        searchResult
    );


    console.log(
        processed
    );


}


test();