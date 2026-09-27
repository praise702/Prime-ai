const searchEngine =
require("./searchEngine");

const processor =
require("./webProcessor");

const extractor =
require("./factExtractor");


async function test(){


    console.log("\n🚀 Prime FACT EXTRACTOR TEST\n");


    const searchResult =
    await searchEngine.search(
        "Albert Einstein"
    );


    const processed =
    processor.processWebResult(
        searchResult
    );


    const facts =
    extractor.extractFacts(
        processed
    );


    console.log("\nFINAL FACTS:\n");

    console.log(facts);


}


test();