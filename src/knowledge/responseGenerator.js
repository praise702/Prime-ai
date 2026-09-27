// Prime Response Generator v3
// Creates cleaner, AI-style answers from ranked facts

function cleanText(text) {
    if (!text) return "";

    return text
        .replace(/\s+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .trim();
}


// Remove duplicate facts
function removeDuplicates(facts) {

    const used = new Set();

    return facts.filter(fact => {

        const clean = fact.answer
            .toLowerCase()
            .trim();

        if (used.has(clean)) {
            return false;
        }

        used.add(clean);
        return true;

    });
}


// Choose important facts
function selectBestFacts(results) {

    let facts = results
        .map(r => ({
            ...r.fact,
            score: r.score
        }))
        .filter(f => f.answer);


    facts = removeDuplicates(facts);


    // Highest importance first
    facts.sort((a,b)=>{

        const imp =
        (b.importance || 5) -
        (a.importance || 5);


        if (imp !== 0)
            return imp;


        return b.score - a.score;

    });


    return facts;

}



// Detect answer size
function chooseFactLimit(question) {

    const words =
    question
    .toLowerCase()
    .split(" ");


    if (
        words.includes("explain") ||
        words.includes("describe") ||
        words.includes("why")
    ) {
        return 5;
    }


    return 3;

}




function generateResponse(results, question) {


    const allFacts =
    selectBestFacts(results);


    const limit =
    chooseFactLimit(question);


    const facts =
    allFacts.slice(0, limit);



    if(facts.length === 0){

        return {
            answer:
            "I could not find information about this topic.",

            confidence:0,

            factsUsed:0,

            sources:[]
        };

    }



    let answer =
    "Here is an explanation:\n\n";



    facts.forEach((fact,index)=>{

        let sentence =
        cleanText(fact.answer);


        if(!sentence.endsWith(".")){
            sentence += ".";
        }


        answer += sentence;


        if(index < facts.length-1){
            answer += " ";
        }

    });



    answer +=
    "\n\nThis information is based on Prime's knowledge database.";



    const topScore =
    results[0]?.score || 0;



    const confidence =
    Math.min(
        98,
        Math.round(60 + topScore * 40)
    );



    return {

        answer,

        confidence,

        factsUsed:facts.length,

        sources:
        facts.map(f=>f.id)

    };

}



module.exports = {
    generateResponse
};