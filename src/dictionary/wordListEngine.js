const words = require("an-array-of-english-words");


function wordExists(word){

    return words.includes(
        word.toLowerCase()
    );

}


module.exports = {
    wordExists
};