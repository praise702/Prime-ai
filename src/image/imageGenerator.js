/*
============================================
 Prime IMAGE GENERATOR v5
 Stability AI Connection
============================================
*/

const stability = require("./providers/stability");



async function generateImage(prompt) {
    const result = await stability.generate(prompt);

    return {
        status: result.success ? "completed" : "error",
        provider: result.provider,
        imageUrl: result.imageUrl || null,
        error: result.error
    };
}



module.exports = {

    generateImage

};
