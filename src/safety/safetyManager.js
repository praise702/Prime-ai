const inputFilter = require("./inputFilter");
const outputFilter = require("./outputFilter");


function validateInput(message) {

    return inputFilter.checkInput(message);

}


function validateOutput(response) {

    return outputFilter.checkOutput(response);

}


module.exports = {
    validateInput,
    validateOutput
};