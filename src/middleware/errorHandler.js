const securityLogger = require("./securityLogger");

function errorHandler(err, req, res, next) {
    if (err?.type === "entity.too.large" || err?.status === 413) {
        securityLogger.event("request_rejected", { reason: "body_too_large" });
        return res.status(413).json({ success: false, error: "Request body is too large." });
    }

    if (err instanceof SyntaxError && "body" in err) {
        securityLogger.event("request_rejected", { reason: "malformed_json" });
        return res.status(400).json({ success: false, error: "Malformed JSON request." });
    }

    securityLogger.event("unexpected_server_error");
    return res.status(500).json({

        success: false,

        error: "Prime Internal Error"

    });

}


module.exports = errorHandler;
