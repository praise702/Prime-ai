const fs = require("fs");

function readFile(filePath) {

    try {

        const content = fs.readFileSync(filePath, "utf8");

        return content;

    }
    catch {

        return "Unable to read file.";

    }

}

module.exports = {
    readFile
};