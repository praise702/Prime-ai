const MAX_MESSAGE_LENGTH = 4000;
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_TEXT = 100_000;
const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor", "userId"]);

function reject(res) {
    return res.status(400).json({
        success: false,
        error: "Invalid chat request."
    });
}

function validateAttachment(item) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;

    const keys = Object.keys(item);
    if (keys.some(key => !["id", "name", "type", "size"].includes(key))) return false;

    if (
        typeof item.id !== "string" ||
        !/^[A-Za-z0-9_-]{16,128}$/.test(item.id)
    ) return false;

    if (
        typeof item.name !== "string" ||
        !item.name.trim() ||
        item.name.length > 255
    ) return false;

    if (
        typeof item.type !== "string" ||
        item.type.length > 150
    ) return false;

    if (
        !Number.isInteger(item.size) ||
        item.size < 0 ||
        item.size > 20 * 1024 * 1024
    ) return false;

    return true;
}

function validateLocation(value) {
    // The frontend intentionally sends `null` when the query does not need
    // location permission. Treat that as the absence of a location, not as an
    // invalid request.
    if (value === undefined || value === null) return true;
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const keys = Object.keys(value);
    if (keys.some(key => !["latitude", "longitude", "accuracy"].includes(key))) return false;
    const latitude = Number(value.latitude);
    const longitude = Number(value.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return false;
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return false;
    if (value.accuracy !== undefined && (!Number.isFinite(Number(value.accuracy)) || Number(value.accuracy) < 0 || Number(value.accuracy) > 1_000_000)) return false;
    return true;
}

function validateChatRequest(req, res, next) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed."
        });
    }

    if (!req.is("application/json")) return reject(res);

    if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
    ) return reject(res);

    const keys = Object.keys(req.body);

    if (
        keys.some(key => FORBIDDEN_KEYS.has(key)) ||
        keys.some(key => !["message", "chatId", "attachments", "location"].includes(key))
    ) return reject(res);

    if (
        typeof req.body.message !== "string" ||
        !req.body.message.trim() ||
        req.body.message.length > MAX_MESSAGE_LENGTH
    ) return reject(res);

    if (
        req.body.chatId !== undefined &&
        (
            typeof req.body.chatId !== "string" ||
            !/^[A-Za-z0-9_-]{1,128}$/.test(req.body.chatId)
        )
    ) return reject(res);

    if (req.body.attachments !== undefined) {
        if (
            !Array.isArray(req.body.attachments) ||
            req.body.attachments.length > MAX_ATTACHMENTS ||
            !req.body.attachments.every(validateAttachment)
        ) return reject(res);
    }

    if (!validateLocation(req.body.location)) return reject(res);

    req.body.message = req.body.message.trim();
    req.body.attachments = req.body.attachments || [];
    if (req.body.location !== undefined && req.body.location !== null) {
        req.body.location = {
            latitude: Number(req.body.location.latitude),
            longitude: Number(req.body.location.longitude),
            accuracy: req.body.location.accuracy === undefined ? undefined : Number(req.body.location.accuracy)
        };
    }

    next();
}

module.exports = {
    validateChatRequest,
    MAX_MESSAGE_LENGTH,
    MAX_ATTACHMENTS,
    MAX_ATTACHMENT_TEXT
};
