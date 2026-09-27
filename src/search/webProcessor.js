// Prime Web Knowledge Processor
// Cleans and prepares external information


function processWebResult(searchResult) {

    console.log("\n🧠 PROCESSING WEB KNOWLEDGE");


    if(
        !searchResult.results ||
        searchResult.results.length === 0
    ){

        return {

            facts: [],
            source: "no-web-data"

        };

    }


    const facts = [];


    searchResult.results.forEach(result => {


        if(result.snippet){


            let text =
            result.snippet
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .trim();


            facts.push({

                title: result.title,

                information: text,

                source: searchResult.source

            });


        }


    });


    return {

        facts,

        source: "web-processor"

    };


}


module.exports = {

    processWebResult

};