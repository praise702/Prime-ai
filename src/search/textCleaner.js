// Prime Text Cleaner v1
// Cleans web text before fact extraction


function cleanText(text) {

    if (!text) {
        return "";
    }


    return text

        // Fix missing spaces between words
        .replace(/([a-z])([A-Z])/g, "$1 $2")

        // Fix missing spaces around special characters
        .replace(/([a-z])(\d)/g, "$1 $2")
        .replace(/(\d)([a-z])/g, "$1 $2")

        // Fix punctuation spacing
        .replace(/\s+([,.!?])/g, "$1")

        // Remove duplicate spaces
        .replace(/\s+/g, " ")

        // Fix common formulas
        .replace(/mc2/g, "mc²")

        .trim();

}



function cleanFacts(facts) {

    return facts.map(item => {

        return {

            ...item,

            fact: cleanText(item.fact)

        };

    });

}



module.exports = {

    cleanText,

    cleanFacts

};