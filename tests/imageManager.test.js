const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "prime-image-test-"));
process.env.PRIME_IMAGE_JOBS_PATH = path.join(testDirectory, "jobs.json");
const { createImage } = require("../src/image/imageManager");

async function run() {
    const unavailable = { name: "Unavailable provider", isAvailable: () => false, generate: async () => ({ success: true }) };
    const failed = { name: "Failed provider", isAvailable: () => true, generate: async () => ({ success: false, status: "error", error: "credit balance exhausted" }) };
    const working = { name: "Working provider", isAvailable: () => true, generate: async () => ({ success: true, imageUrl: "data:image/png;base64,iVBORw0KGgo=" }) };

    const fallbackResult = await createImage("a robot", [unavailable, failed, working]);
    assert.equal(fallbackResult.success, true);
    assert.equal(fallbackResult.provider, "Working provider");
    assert.ok(fallbackResult.imageUrl);

    const failureResult = await createImage("a robot", [unavailable, failed]);
    assert.equal(failureResult.success, false);
    assert.equal(failureResult.imageUrl, null);
    assert.equal(failureResult.error, "All image providers failed");
    console.log("imageManager fallback tests passed");
}

run()
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => fs.rmSync(testDirectory, { recursive: true, force: true }));
