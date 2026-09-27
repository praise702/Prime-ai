// Prime Answer Composer
// Converts raw facts into a more human-like structure


function cleanSentence(text) {

    if (!text) return "";

    text = text
        .replace(/\s+/g, " ")
        .trim();


    if (!text.endsWith(".")) {
        text += ".";
    }


    return text;
}



// Find the main definition fact
function findMainFact(facts) {

    return facts.find(fact => {

        const q =
        fact.question.toLowerCase();


        return (
            q.includes("is") ||
            q.includes("are") ||
            q.includes("called")
        );

    });

}



// Remove repeated meanings
function removeSimilarFacts(facts) {

    const words = new Set();


    return facts.filter(fact => {


        const key =
        fact.answer
        .toLowerCase()
        .split(" ")
        .slice(0,5)
        .join(" ");


        if(words.has(key)){
            return false;
        }


        words.add(key);

        return true;

    });

}




function composeAnswer(facts, question) {


    if(!facts || facts.length === 0){

        return [];

    }



    facts =
    removeSimilarFacts(facts);



    let ordered = [];



    // Put definition first

    const main =
    findMainFact(facts);



    if(main){

        ordered.push(main);

    }



    // Add remaining useful facts

    facts.forEach(fact=>{

        if(
            !ordered.includes(fact)
        ){

            ordered.push(fact);

        }

    });



    return ordered;

}



module.exports = {

    composeAnswer

};