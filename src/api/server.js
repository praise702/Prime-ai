const express = require("express");
const helmet = require("helmet");
const path = require("path");
const routes = require("./routes");
const chatRoutes = require("./chatRoutes");
const uploadRoutes = require("./uploadRoutes");
const searchRoutes = require("./searchRoutes");
const imageRouter = require("../image/imageRouter");
const createAuthRoutes = require("../auth/authRoutes");
const { auth } = require("../middleware/auth");
const config = require("../config/config");
const imageConfig = require("../image/imageConfig");
const errorHandler = require("../middleware/errorHandler");
const corsPolicy = require("../middleware/corsPolicy");
const { validateChatRequest } = require("../middleware/requestValidation");
const { createChatRateLimiters } = require("../middleware/rateLimit");
const db = require("../storage/database");

function createApp(options = {}) {
    db.ensure();

    const app = express();
    const rateLimiters = createChatRateLimiters(
        options.rateLimit || config.rateLimit
    );

    app.disable("x-powered-by");
    app.set("trust proxy", config.trustProxy);

    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                connectSrc: ["'self'", "https://fonts.googleapis.com"],
                imgSrc: ["'self'", "data:", "blob:"],
                mediaSrc: ["'self'", "blob:"],
                objectSrc: ["'none'"],
                baseUri: ["'self'"],
                frameAncestors: ["'none'"],
                formAction: ["'self'"]
            }
        },
        hsts: false,
        referrerPolicy: {
            policy: "strict-origin-when-cross-origin"
        },
        crossOriginEmbedderPolicy: false
    }));

    app.use((req, res, next) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("Permissions-Policy", "camera=(), microphone=(self), geolocation=(self), payment=(), usb=()");
        if (config.enableHsts && req.secure) {
            res.setHeader(
                "Strict-Transport-Security",
                "max-age=15552000; includeSubDomains"
            );
        }

        next();
    });

    app.use(corsPolicy);

    // Reject obviously oversized requests before JSON parsing.
    app.use((req, res, next) => {
        const length = Number(req.headers["content-length"] || 0);

        if (length > 12 * 1024 * 1024) {
            return res.status(413).json({
                success: false,
                error: "Request is too large."
            });
        }

        next();
    });

    app.use(express.json({
        limit: config.requestBodyLimit,
        strict: true
    }));

    app.use(express.static(path.join(__dirname, "../frontend")));

    app.get("/health", (req, res) => {
        res.json({
            success: true,
            service: "Prime",
            status: "ok",
            version: config.version,
            model: process.env.PRIME_MODEL_NAME || "local-model"
        });
    });

    app.use("/generated", auth, express.static(imageConfig.outputDirectories.generated, {
        fallthrough: false,
        etag: true,
        maxAge: "1h",
        index: false
    }));

    app.use("/api/auth", createAuthRoutes(rateLimiters));
    app.use("/api/chats", auth, chatRoutes);
    app.use("/api/search", auth, rateLimiters.search, searchRoutes);

    app.use(
        "/api/uploads",
        auth,
        rateLimiters.upload,
        uploadRoutes
    );

    app.use("/api/images", auth, rateLimiters.image, imageRouter);

    app.use(
        "/chat",
        validateChatRequest,
        auth,
        rateLimiters.burst,
        rateLimiters.ip,
        rateLimiters.user
    );

    app.use("/", routes);
    app.use(errorHandler);

    return app;
}

function startServer() {
    const app = createApp();

    const server = app.listen(
        config.port,
        "0.0.0.0",
        () => {
            console.log(
                `\n=== Prime Engine ${config.version} ===\n` +
                `Browser: http://localhost:${config.port}\n` +
                `Bind: all interfaces on port ${config.port}\n` +
                `Database: local Prime storage\n` +
                `Model: ${process.env.PRIME_MODEL_NAME || "local-model"}\n`
            );
        }
    );

    server.on("error", error => {
        console.error("❌ Prime server failed to start:", error.message);
        process.exitCode = 1;
    });

    return server;
}

module.exports = startServer;
module.exports.createApp = createApp;
