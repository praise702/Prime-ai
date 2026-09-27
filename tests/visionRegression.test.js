const assert = require("assert");
const axios = require("axios");

const modelConnector = require("../src/models/modelConnector");
const modelManager = require("../src/models/modelManager");
const queryUnderstanding = require("../src/intelligence/queryUnderstanding");
const answerGenerator = require("../src/brain/answerGenerator");

async function run() {
    process.env.PRIME_MODEL_PROVIDER = "ollama";
    process.env.PRIME_VISION_ENABLED = "true";
    process.env.PRIME_VISION_MODEL = "qwen3-vl:8b";
    process.env.PRIME_VISION_MODEL_URL = "http://127.0.0.1:11434/api/chat";

    const originalPost = axios.post;
    let captured = null;
    axios.post = async (url, payload) => {
        captured = { url, payload };
        return { data: { message: { content: "The image shows a desktop screenshot with a user interface and visible text." } } };
    };

    try {
        const answer = await modelConnector.generateVision(
            "Tell me about this image",
            "",
            [{ name: "test.png", mimeType: "image/png", base64: "iVBORw0KGgo=", dataUrl: "data:image/png;base64,iVBORw0KGgo=" }]
        );
        assert.match(answer, /desktop screenshot/);
        assert.equal(captured.payload.model, "qwen3-vl:8b");
        assert.equal(captured.payload.messages[0].images[0], "iVBORw0KGgo=");

        const gpu = queryUnderstanding.understandQuery("LATEST 5 GPU");
        assert.equal(gpu.intent, "LATEST_GPU");

        const models = [
            { title: "NVIDIA GeForce RTX 5090 graphics card", text: "A current GeForce RTX 5090 GPU." },
            { title: "NVIDIA GeForce RTX 5080 graphics card", text: "A current GeForce RTX 5080 GPU." },
            { title: "AMD Radeon RX 9070 XT", text: "A current Radeon RX 9070 XT GPU." },
            { title: "AMD Radeon RX 9070 GRE", text: "A current Radeon RX 9070 GRE GPU." },
            { title: "Intel Arc B580", text: "A current Intel Arc B580 GPU." }
        ];
        const generated = answerGenerator.generateAnswer(models, "latest 5 gpu");
        assert.match(generated.answer, /GeForce RTX 5090/);
        assert.match(generated.answer, /Arc B580/);
        assert.equal(generated.tool, "gpu-search");

        assert.equal(typeof modelManager.askVisionModel, "function");
        console.log("vision and GPU regression checks passed");
    } finally {
        axios.post = originalPost;
    }
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
