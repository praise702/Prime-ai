const fs = require("fs");
const path = require("path");

const logDirectory = path.join(__dirname, "../../logs");
const logFile = path.join(logDirectory, "prime.log");

function ensureLogDirectory() {
    try {
        fs.mkdirSync(logDirectory, { recursive: true });
        return true;
    } catch (error) {
        console.error("Logger directory error:", error.message);
        return false;
    }
}

function log(level, message) {
    const time = new Date().toISOString();
    const logMessage = "[" + time + "] [" + level + "] " + message + "\n";

    console.log(logMessage.trim());

    try {
        if (ensureLogDirectory()) {
            fs.appendFileSync(logFile, logMessage);
        }
    } catch (error) {
        console.error("File logging error:", error.message);
    }
}

module.exports = {
    info: (message) => log("INFO", message),
    warn: (message) => log("WARN", message),
    error: (message) => log("ERROR", message)
};