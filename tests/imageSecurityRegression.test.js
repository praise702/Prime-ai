const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "prime-image-security-"));
process.env.PRIME_DATA_DIR = testDirectory;

const history = require("../src/image/imageHistory");

function run() {
    history.saveImage("user-a", "prompt A", "enhanced A", {
        imageUrl: "/generated/a.png",
        requestId: "req-a"
    });
    history.saveImage("user-b", "prompt B", "enhanced B", {
        imageUrl: "/generated/b.png",
        requestId: "req-b"
    });

    const a = history.getImages("user-a");
    const b = history.getImages("user-b");
    assert.equal(a.length, 1);
    assert.equal(b.length, 1);
    assert.match(a[0].id, /^img_[A-Fa-f0-9]{36}$/);
    assert.notEqual(a[0].id, b[0].id);
    assert.equal(a[0].imageUrl, "/generated/a.png");

    assert.equal(history.deleteImage("user-b", a[0].id), false);
    assert.equal(history.getImages("user-a").length, 1);
    assert.equal(history.deleteImage("user-a", a[0].id), true);
    assert.equal(history.getImages("user-a").length, 0);

    console.log("image history ownership regression checks passed");
}

try {
    run();
} finally {
    fs.rmSync(testDirectory, { recursive: true, force: true });
}
