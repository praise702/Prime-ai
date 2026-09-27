function detect(message) {

    const text = message.toLowerCase();

    if(text.startsWith("calculate")) {

        return {
            tool: "calculator"
        };

    }

    if(text.startsWith("read file")) {

        return {
            tool: "fileReader"
        };

    }

    return {
        tool: null
    };

}

module.exports = {
    detect
};