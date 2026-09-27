const { validateGeneratedFile } = require("./imageLifecycle");

function validateProviderResult(result) {
    if (!result?.imageUrl || typeof result.imageUrl !== "string") {
        return { valid: false, error: "Provider returned no image URL" };
    }

    if (result.filePath) {
        const file = validateGeneratedFile(result.filePath);
        return file.valid ? { valid: true, ...file } : { valid: false, error: file.reason };
    }

    // Remote providers expose an actual provider URL. Its bytes cannot be scored
    // until downloaded, so no quality score is fabricated here.
    return { valid: true, validation: "provider-url-not-locally-inspected" };
}

module.exports = { validateProviderResult };
