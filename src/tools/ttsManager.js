/*
====================================================
PRIME TTS MANAGER
Kokoro Local TTS Bridge
====================================================
*/

const axios = require("axios");


// ============================================
// KOKORO SERVER
// ============================================

const KOKORO_TTS_URL =
    "http://127.0.0.1:5050/tts";


// ============================================
// GENERATE SPEECH
// ============================================

async function generateSpeech(text) {

    const cleanText =
        typeof text === "string"
            ? text.trim()
            : "";

    if (!cleanText) {
        throw new Error(
            "TTS text is required"
        );
    }


    const response =
        await axios.post(

            KOKORO_TTS_URL,

            {
                text: cleanText
            },

            {
                responseType: "arraybuffer",

                timeout: 120000,

                headers: {
                    "Content-Type":
                        "application/json"
                }
            }

        );


    if (
        !response.data ||
        response.data.length === 0
    ) {

        throw new Error(
            "Kokoro returned empty audio"
        );

    }


    return Buffer.from(
        response.data
    );

}


// ============================================
// EXPORT
// ============================================

module.exports = {

    generateSpeech

};