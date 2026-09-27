/**
 * ============================================
 * 🚀 Prime API CONTROLLER v8
 * Professional Response System + Image Bridge
 * + Kokoro TTS
 * ============================================
 *
 * Handles:
 * ✅ User messages
 * ✅ Brain processing
 * ✅ Image requests
 * ✅ Image generation
 * ✅ Image URL bridge
 * ✅ Image follow-up questions
 * ✅ Clean AI response
 * ✅ Metadata
 * ✅ Kokoro voice generation
 * ✅ Error handling
 *
 * ============================================
 */

const brain =
    require("../brain/brain");

const logger =
    require("../utils/logger");

const safetyManager =
    require("../safety/safetyManager");

const securityLogger =
    require("../middleware/securityLogger");

const ttsManager =
    require("../tools/ttsManager");

const imageController =
    require("../image/imageController");

const config =
    require("../config/config");

const fs = require("fs");
const path = require("path");


// ============================================
// IMAGE REQUEST DETECTOR
// ============================================

function isImageRequest(message) {

    if (
        !message ||
        typeof message !== "string"
    ) {

        return false;

    }


    const text =
        message
            .toLowerCase()
            .trim();


    // ============================================
    // QUESTIONS ABOUT AN EXISTING IMAGE
    // ============================================

    const imageQuestionPatterns = [

        "why did you create",
        "why you created",

        "why did you make",
        "why you made",

        "why did you generate",
        "why you generated",

        "what is this image",
        "what does this image",
        "what is the image",

        "describe this image",
        "describe the image",

        "explain this image",
        "explain the image",

        "why does the image",
        "why is the image",

        "what happened to the image",

        "tell me about this image",
        "tell me about the image"

    ];


    // ============================================
    // NEVER GENERATE FOR IMAGE QUESTIONS
    // ============================================

    if (
        imageQuestionPatterns.some(
            pattern =>
                text.includes(pattern)
        )
    ) {

        return false;

    }


    // ============================================
    // EXPLICIT IMAGE WORDS
    // ============================================

    const imageWords = [

        "image",
        "picture",
        "photo",
        "drawing",
        "illustration",
        "artwork",
        "wallpaper",
        "avatar",
        "logo",

        // Common typing mistake
        "imgae"

    ];


    // ============================================
    // IMAGE CREATION WORDS
    // ============================================

    const creationWords = [

        "create",
        "make",
        "generate",
        "draw",
        "design",
        "illustrate",
        "render",
        "paint",
        "show",
        "give"

    ];


    // ============================================
    // CHECK IMAGE + CREATION WORD
    // ============================================

    const hasImageWord =
        imageWords.some(
            word =>
                text.includes(word)
        );


    const hasCreationWord =
        creationWords.some(
            word =>
                text.includes(word)
        );


    if (
        hasImageWord &&
        hasCreationWord
    ) {

        return true;

    }


    // ============================================
    // NATURAL IMAGE REQUESTS
    // ============================================

    const naturalImagePatterns = [

        /^create\s+(a|an|the)?\s*.+/i,

        /^make\s+(a|an|the)?\s*.+/i,

        /^generate\s+(a|an|the)?\s*.+/i,

        /^draw\s+(a|an|the)?\s*.+/i,

        /^design\s+(a|an|the)?\s*.+/i,

        /^illustrate\s+(a|an|the)?\s*.+/i,

        /^render\s+(a|an|the)?\s*.+/i,

        /^show\s+me\s+(a|an|the)?\s*.+/i,

        /^give\s+me\s+(a|an|the)?\s*.+/i,

        /^make\s+me\s+(a|an|the)?\s*.+/i,

        /^create\s+me\s+(a|an|the)?\s*.+/i

    ];


    if (
        naturalImagePatterns.some(
            pattern =>
                pattern.test(text)
        )
    ) {

        return true;

    }


    // ============================================
    // "I WANT AN IMAGE..."
    // ============================================

    if (

        /^(i want|i need|can you make|can you create|can you generate)\b/i
            .test(text)

        &&

        (
            hasImageWord ||
            /\b(of|for)\b/i.test(text)
        )

    ) {

        return true;

    }


    // ============================================
    // CHARACTER IMAGE REQUESTS
    // ============================================

    const characterWords = [

        "character",
        "avatar",
        "boy",
        "girl",
        "person",
        "robot",
        "dragon",
        "animal"

    ];


    const hasCharacter =
        characterWords.some(
            word =>
                text.includes(word)
        );


    if (
        hasCharacter &&
        hasCreationWord
    ) {

        return true;

    }


    // ============================================
    // GAME CHARACTER REQUESTS
    // ============================================

    const gameWords = [

        "minecraft",
        "roblox",
        "fortnite",
        "game character",
        "game avatar"

    ];


    if (
        gameWords.some(
            word =>
                text.includes(word)
        )
    ) {

        return true;

    }


    // ============================================
    // VISUAL SUBJECT + IMAGE VERB
    // ============================================

    const imageVerbs = [

        "create",
        "generate",
        "make",
        "draw",
        "design",
        "paint",
        "illustrate",
        "render"

    ];


    const visualSubjects = [

        "car",
        "vehicle",
        "sports car",

        "house",
        "building",
        "city",
        "landscape",
        "mountain",

        "animal",
        "dog",
        "cat",
        "dragon",
        "robot",

        "person",
        "people",
        "character",
        "avatar",
        "portrait",

        "scene",
        "wallpaper",
        "logo",
        "poster",

        "artwork",
        "illustration",
        "image",
        "picture",
        "photo"

    ];


    const hasImageVerb =
        imageVerbs.some(
            verb =>
                new RegExp(
                    "\\b" +
                    verb +
                    "\\b",
                    "i"
                ).test(text)
        );


    const hasVisualSubject =
        visualSubjects.some(
            subject =>
                new RegExp(
                    "\\b" +
                    subject +
                    "\\b",
                    "i"
                ).test(text)
        );


    if (
        hasImageVerb &&
        hasVisualSubject
    ) {

        return true;

    }


    // ============================================
    // OTHERWISE NORMAL AI
    // ============================================

    return false;

}


// ============================================
// LOAD VERIFIED ATTACHMENTS
// ============================================

async function loadAttachments(userId, attachments) {
    if (!Array.isArray(attachments) || attachments.length === 0) {
        return {
            promptContext: "",
            metadata: [],
            visionImages: []
        };
    }

    const uploadDir = path.join(config.dataDir, "uploads");
    const promptParts = [];
    const metadata = [];
    const visionImages = [];
    const maxVisionBytes = Number(process.env.PRIME_VISION_MAX_IMAGE_BYTES || 6 * 1024 * 1024);

    for (const attachment of attachments.slice(0, 5)) {
        if (!/^[A-Za-z0-9_-]{16,128}$/.test(String(attachment.id || ""))) {
            throw new Error("Invalid attachment.");
        }

        const metadataPath = path.join(uploadDir, `${attachment.id}.json`);
        if (!fs.existsSync(metadataPath)) {
            throw new Error("Attachment not found.");
        }

        let stored;
        try {
            stored = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
        } catch {
            throw new Error("Attachment metadata is invalid.");
        }

        if (
            stored.userId !== userId ||
            stored.id !== attachment.id ||
            !fs.existsSync(stored.path)
        ) {
            throw new Error("Attachment access denied.");
        }

        metadata.push({
            id: stored.id,
            name: stored.name,
            type: stored.type,
            size: stored.size,
            url: `/api/uploads/${stored.id}`,
            hasVision: false
        });

        if (/^(text\/|application\/json$|application\/xml$)/i.test(stored.type)) {
            const content = fs.readFileSync(stored.path, "utf8").slice(0, 100_000);
            if (content.trim()) {
                promptParts.push(`Attached file "${stored.name}":\n${content}`);
            }
        } else if (stored.type.startsWith("image/")) {
            const stat = fs.statSync(stored.path);
            if (stat.size > maxVisionBytes) {
                promptParts.push(`The attached image "${stored.name}" is too large for direct visual analysis.`);
                continue;
            }

            const bytes = fs.readFileSync(stored.path);
            const base64 = bytes.toString("base64");
            visionImages.push({
                id: stored.id,
                name: stored.name,
                mimeType: stored.type,
                base64,
                dataUrl: `data:${stored.type};base64,${base64}`
            });
            metadata[metadata.length - 1].hasVision = true;
            promptParts.push(`Attached image "${stored.name}" is available for visual analysis.`);
        } else {
            let parsed = null;
            if (doclingClient.enabled() && /(?:pdf|word|document|spreadsheet|presentation|officedocument)/i.test(stored.type)) {
                parsed = await doclingClient.convert(stored.path, stored.type);
            }
            if (parsed && parsed.trim()) {
                promptParts.push(`Structured content from attached file "${stored.name}":\n${parsed.slice(0, 120000)}`);
                metadata[metadata.length - 1].parsedWith = "docling";
            } else {
                promptParts.push(`The user attached "${stored.name}" (${stored.type}).`);
            }
        }
    }

    return {
        promptContext: promptParts.join("\n\n"),
        metadata,
        visionImages: visionImages.slice(0, 3)
    };
}



// ============================================
// CHAT CONTROLLER
// ============================================

exports.chat = async function(req, res) {

    try {


        // ====================================
        // GET MESSAGE
        // ====================================

        const message =
            typeof req.body?.message === "string"
                ? req.body.message.trim()
                : "";


        // ====================================
        // GET AUTHENTICATED USER
        // ====================================

        // The authenticated user ID comes from
        // the server-side authentication middleware.

        const userId =
            req.user?.id;


        if (!userId) {

            return res.status(401).json({

                success: false,

                error:
                    "Authentication is required."

            });

        }


        // ====================================
        // VALIDATE MESSAGE
        // ====================================

        if (!message) {

            return res.status(400).json({

                success: false,

                error:
                    "Message is required"

            });

        }


        const inputSafety =
            safetyManager.validateInput(
                message
            );


        if (!inputSafety.allowed) {

            return res.status(400).json({

                success: false,

                error:
                    "Invalid chat request."

            });

        }


        let attachmentContext;

        try {
            attachmentContext = await loadAttachments(
                userId,
                req.body.attachments
            );
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error.message || "Invalid attachment."
            });
        }

        const brainMessage =
            attachmentContext.promptContext
                ? `${message}

${attachmentContext.promptContext}`
                : message;


        // ====================================
        // LOG USER
        // ====================================

        logger.info(
            "chat_message_accepted"
        );


        // ====================================
        // IMAGE SYSTEM
        // ====================================

        if (
            isImageRequest(message)
        ) {

            console.log(
                "🎨 IMAGE REQUEST DETECTED"
            );


            try {


                // =================================
                // CREATE IMAGE REQUEST
                // =================================

                const fakeReq = {

                    body: {

                        prompt:
                            message

                    },

                    // imageController authenticates from req.user.
                    // The bridge must preserve the already-authenticated chat user.
                    user: req.user

                };


                // =================================
                // CREATE IMAGE RESPONSE BRIDGE
                // =================================

                const imageResponse =

                    await new Promise(

                        (resolve, reject) => {

                            let resolved =
                                false;


                            const fakeRes = {

                                status(code) {

                                    this.statusCode =
                                        code;

                                    return this;

                                },


                                json(data) {

                                    if (!resolved) {

                                        resolved =
                                            true;

                                        resolve(data);

                                    }

                                }

                            };


                            /*
                             * NOTE:
                             * This legacy image branch is intentionally
                             * preserved exactly as part of the existing
                             * controller architecture.
                             */

                            try {

                                Promise.resolve(

                                    imageController.createImage(

                                        fakeReq,

                                        fakeRes

                                    )

                                )
                                    .catch(error => {

                                        if (!resolved) {

                                            resolved =
                                                true;

                                            reject(error);

                                        }

                                    });

                            }

                            catch (error) {

                                if (!resolved) {

                                    resolved =
                                        true;

                                    reject(error);

                                }

                            }

                        }

                    );


                // =================================
                // LOG IMAGE RESPONSE
                // =================================

                console.log(

                    "🎨 IMAGE CONTROLLER RESPONSE:",

                    imageResponse

                );


                // =================================
                // CHECK IMAGE RESPONSE
                // =================================

                if (
                    !imageResponse ||
                    imageResponse.success === false
                ) {

                    return res.status(500).json({

                        success: false,

                        type:
                            "image",

                        imageUrl:
                            null,

                        image:
                            imageResponse?.image
                            ||
                            null,

                        error:

                            imageResponse?.error

                            ||

                            "Image generation failed"

                    });

                }


                // =================================
                // EXTRACT IMAGE OBJECT
                // =================================

                const imageData =
                    imageResponse.image
                    ||
                    {};


                // =================================
                // GET IMAGE URL
                // =================================

                const imageUrl =

                    imageData.imageUrl

                    ||

                    imageResponse.imageUrl

                    ||

                    null;


                console.log(

                    "🖼️ IMAGE URL:",

                    imageUrl

                );


                // =================================
                // RETURN IMAGE TO FRONTEND
                // =================================

                return res.json({

                    success: true,

                    assistant:
                        "Prime",

                    type:
                        "image",

                    imageUrl:
                        imageUrl,

                    originalPrompt:

                        imageResponse.originalPrompt

                        ||

                        message,

                    enhancedPrompt:

                        imageResponse.enhancedPrompt

                        ||

                        "",

                    image: {

                        status:

                            imageData.status

                            ||

                            "ready",

                        imageUrl:
                            imageUrl

                    },

                    message: {

                        text:
                            "",

                        type:
                            "image"

                    },

                    metadata: {

                        confidence:
                            100,

                        tool:
                            "image-generator"

                    },

                    timestamp:

                        new Date()
                            .toISOString()

                });


            }

            catch (imageError) {

                console.log(

                    "❌ IMAGE GENERATION ERROR:",

                    imageError

                );


                return res.status(500).json({

                    success: false,

                    error:
                        "Prime image generation failed"

                });

            }

        }


        // ====================================
        // NORMAL AI BRAIN
        // ====================================

        const chatId = req.body.chatId;

        // Restore the persisted conversation into Prime's bounded working memory
        // before processing. Long-term memory remains separately user-scoped.
        if (chatId) {
            const chatStore = require("./chatStore");
            const shortMemory = require("../memory/shortMemory");
            const storedChat = chatStore.get(userId, chatId);

            shortMemory.replaceMemory(
                `${userId}\u0000${chatId}`,
                (storedChat?.messages || []).slice(-50).map(item => ({
                    role: item.sender === "user" ? "user" : "assistant",
                    message: item.text,
                    time: item.time
                }))
            );
        }

        // For follow-up messages such as "tell me about that image", reuse the
        // most recent image attached in this chat even when the user didn't re-upload it.
        let visionImages = attachmentContext.visionImages || [];
        const hasImageReference = /\b(image|picture|photo|screenshot|attached|this|that|it|these|those)\b/i.test(message);
        if (!visionImages.length && chatId && hasImageReference) {
            const chatStore = require("./chatStore");
            const storedChat = chatStore.get(userId, chatId);
            const recentImageAttachments = [];
            for (const item of [...(storedChat?.messages || [])].reverse()) {
                for (const attachment of [...(item.attachments || [])].reverse()) {
                    if (/^image\//i.test(String(attachment.type || ""))) {
                        recentImageAttachments.push(attachment);
                    }
                }
                if (recentImageAttachments.length >= 3) break;
            }
            if (recentImageAttachments.length) {
                try {
                    const reused = await loadAttachments(userId, recentImageAttachments);
                    visionImages = reused.visionImages || [];
                } catch {}
            }
        }

        const result = await brain.processMessage(
            brainMessage,
            userId,
            chatId,
            {
                location: req.body.location,
                visionImages,
                attachments: attachmentContext.metadata
            }
        );


        // ====================================
        // RESPONSE VARIABLES
        // ====================================

        let answer =
            "";

        let metadata =
            {};


        // ====================================
        // PROCESS BRAIN RESULT
        // ====================================

        if (
            typeof result === "object" &&
            result !== null
        ) {

            answer =

                result.answer

                ||

                "I am still learning this topic.";


            metadata = {

                confidence:

                    result.confidence

                    ||

                    0,

                tool:

                    result.tool

                    ||

                    "brain",

                analysis:

                    result.analysis

                    ||

                    null,

                query:

                    result.query

                    ||

                    null,

                correction:
                    result.query?.correctionApplied
                        ? {
                            changed: true,
                            original: String(result.query.originalQuery || "").slice(0, 500),
                            corrected: String(result.query.correctedQuery || result.query.normalizedQuery || "").slice(0, 500)
                        }
                        : { changed: false },

                // Search evidence is intentionally not exposed in the normal UI.
                // Enable PRIME_EXPOSE_SEARCH_METADATA only for development/debugging.
                search:
                    process.env.PRIME_EXPOSE_SEARCH_METADATA === "true"
                        ? {
                            used: Array.isArray(result.searchResults) && result.searchResults.length > 0,
                            results: Array.isArray(result.searchResults) ? result.searchResults.slice(0, 12) : []
                        }
                        : undefined,

                sources:
                    process.env.PRIME_EXPOSE_SEARCH_METADATA === "true"
                        ? (Array.isArray(result.sources) ? result.sources : [])
                        : []

            };

        }

        else {

            answer =
                String(result);

        }


        // ====================================
        // FINAL AI OUTPUT SAFETY
        // ====================================

        answer =
            safetyManager
                .validateOutput(
                    String(answer)
                )
                .slice(0, 12_000);


        // ====================================
        // KOKORO TTS
        // ====================================

        let audioBase64 =
            null;


        try {

            const audioBuffer =
                await ttsManager.generateSpeech(
                    answer
                );


            if (
                audioBuffer &&
                audioBuffer.length > 0
            ) {

                audioBase64 =
                    audioBuffer.toString(
                        "base64"
                    );

            }

        }

        catch (ttsError) {

            logger.warn(
                "tts_generation_failed"
            );

        }


        // ====================================
        // LOG AI RESPONSE
        // ====================================

        logger.info(
            "chat_response_sent"
        );


        // ====================================
        // NORMAL AI RESPONSE
        // ====================================

        return res.json({

            success: true,

            assistant:
                "Prime",

            message: {

                text:
                    answer,

                type:
                    "assistant",

                attachments:
                    attachmentContext.metadata

            },


            // =================================
            // KOKORO AUDIO
            // =================================

            audio:

                audioBase64

                    ? {

                        base64:
                            audioBase64,

                        mimeType:
                            "audio/wav"

                    }

                    : null,


            metadata,

            timestamp:

                new Date()
                    .toISOString()

        });


    }

    catch (error) {

        securityLogger.event(
            "chat_processing_failure"
        );


        return res.status(500).json({

            success: false,

            error:
                "Prime Internal Error"

        });

    }

};
