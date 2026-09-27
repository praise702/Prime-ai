function checkInput(message) {

    if (!message || message.trim().length === 0) {

        return {
            allowed: false,
            reason: "Empty message"
        };

    }


    if (message.length > 5000) {

        return {
            allowed: false,
            reason: "Message too long"
        };

    }


    return {
        allowed: true
    };

}


module.exports = {
    checkInput
};