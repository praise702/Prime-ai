const logger = require("../utils/logger");

function event(name, details = {}) {
    // Deliberately accept only operational, non-secret fields at this boundary.
    logger.info(JSON.stringify({ event: name, ...details }));
}

module.exports = { event };
