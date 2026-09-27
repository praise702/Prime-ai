function checkOutput(response) {

    if (!response) {

        return "I could not generate a response.";

    }


    return response;

}


module.exports = {
    checkOutput
};