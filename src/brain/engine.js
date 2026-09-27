const modelManager = require("../models/modelManager");


async function think(message) {

    console.log("🧠 Prime Thinking...");


    const response = await modelManager.askModel(
        message,
        ""
    );


    return response;

}


module.exports = {
    think
};