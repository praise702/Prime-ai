const modelConnector = require("./modelConnector");

async function askModel(message, context = "", options = {}) {
    return modelConnector.generate(message, context, options);
}

function enabled() {
    return modelConnector.enabled();
}

function endpoint() {
    return modelConnector.endpoint();
}

function modelName() {
    return modelConnector.modelName();
}

function askVisionModel(message, context = "", images = [], options = {}) {
    return modelConnector.generateVision(message, context, images, options);
}

module.exports = {
    askModel,
    askVisionModel,
    enabled,
    endpoint,
    modelName,
    visionEnabled: modelConnector.visionEnabled,
    visionEndpoint: modelConnector.visionEndpoint,
    visionModelName: modelConnector.visionModelName
};
