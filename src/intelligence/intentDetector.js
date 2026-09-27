function detectIntent(message) {

    if (!message || typeof message !== "string") {
        return {
            intent: "UNKNOWN",
            confidence: 0.0,
            isGreeting: false,
            requiresTool: false,
            targetTopic: ""
        };
    }


    const text = message.toLowerCase().trim();


    // ============================================
    // IMAGE GENERATION
    // ============================================

    if (
        /\b(create|generate|make|draw|design|render|produce)\b.*\b(image|picture|photo|artwork|illustration|portrait|wallpaper|logo|scene)\b/i.test(text)
        ||
        /\b(create|generate|make|draw|design|render|produce)\b.*\b(realistic|photorealistic|anime|cartoon|3d|cyberpunk|painting)\b/i.test(text)
        ||
        /\b(image|picture|photo|artwork|illustration|portrait|wallpaper)\b.*\b(of|showing|with)\b/i.test(text)
    ) {

        return {
            intent: "IMAGE_GENERATION",
            confidence: 0.97,
            isGreeting: false,
            requiresTool: true,
            tool: "imageGenerator",
            targetTopic: "image generation"
        };

    }


    // ============================================
    // TOOL DETECTION
    // ============================================

    if (/^(calculate|compute|math)\b/i.test(text)) {
        return {
            intent: "TOOL_REQUEST",
            tool: "calculator",
            confidence: 0.95,
            isGreeting: false,
            requiresTool: true
        };
    }


    if (/^(read file|open file|view file)\b/i.test(text)) {
        return {
            intent: "TOOL_REQUEST",
            tool: "fileReader",
            confidence: 0.95,
            isGreeting: false,
            requiresTool: true
        };
    }


    // ============================================
    // GREETINGS
    // ============================================

    if (
        /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|who are you|what is your name)\b/i.test(text)
        &&
        text.split(/\s+/).length <= 4
    ) {

        return {
            intent: "GREETING",
            confidence: 0.95,
            isGreeting: true,
            requiresTool: false
        };

    }


    // ============================================
    // COMPARISON
    // ============================================

    if (
        /\b(difference between|compare|versus|vs|similarities between)\b/i.test(text)
    ) {

        return {
            intent: "COMPARISON",
            confidence: 0.90,
            isGreeting: false,
            requiresTool: false
        };

    }


    // ============================================
    // EXPLANATION / DEEP REQUEST
    // ============================================

    if (
        /\b(explain|how does|how do|describe|elaborate|details on|tell me how)\b/i.test(text)
    ) {

        return {
            intent: "EXPLANATION",
            confidence: 0.90,
            isGreeting: false,
            requiresTool: false
        };

    }


    // ============================================
    // QUESTION / DEFINITION
    // ============================================

    if (
        /\b(what is|what are|define|who is|where is|whyis|why do|is a|are there|can you tell me|what does)\b/i.test(text)
        ||
        text.endsWith("?")
    ) {

        return {
            intent: "QUESTION_ANSWER",
            confidence: 0.92,
            isGreeting: false,
            requiresTool: false
        };

    }


    // ============================================
    // DEFAULT GENERAL QUERY / CONVERSATION
    // ============================================

    return {
        intent: "GENERAL_QUERY",
        confidence: 0.70,
        isGreeting: false,
        requiresTool: false
    };

}


module.exports = {
    detectIntent,
    detect: detectIntent
};