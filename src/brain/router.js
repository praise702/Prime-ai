function route(message) {

    const text = message.toLowerCase();

    if (text.startsWith("calculate")) {
        return "tool";
    }

    if (text.startsWith("read file")) {
        return "tool";
    }

    if (text.includes("my name is")) {
        return "memory";
    }

    if (text.includes("what is my name")) {
        return "memory";
    }

    if (text.includes("who created you")) {
        return "knowledge";
    }

    if (text.includes("what is your name")) {
        return "knowledge";
    }

    if (text.startsWith("explain")) {
        return "reasoning";
    }

    return "engine";
}

module.exports = {
    route
};