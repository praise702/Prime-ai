function analyze(message) {

    const text = message.toLowerCase();


    if(text.includes("calculate")) {

        return {
            type: "tool",
            action: "calculator"
        };

    }


    if(text.includes("explain")) {

        return {
            type: "explain"
        };

    }


    return {
        type: "normal"
    };

}


module.exports = {
    analyze
};