/**
 * ============================================
 * 🧠 Prime SHORT TERM MEMORY v5
 * ============================================
 *
 * User-specific conversation memory
 *
 * Features:
 *
 * ✅ Multi-user separation
 * ✅ Conversation tracking
 * ✅ Context building
 * ✅ 50 message window per user
 * ✅ Recent messages
 * ✅ Empty protection
 * ✅ Clear individual user memory
 * ✅ Backward-compatible API
 *
 * ============================================
 */

const conversations = new Map();

const MAX_MESSAGES = 50;


// ============================================
// CLEAN MESSAGE
// ============================================

function cleanMessage(message) {

    if (!message) {
        return "";
    }

    return String(message).trim();

}


// ============================================
// NORMALIZE USER ID
// ============================================

function normalizeUserId(userId) {

    const value = String(userId || "").trim();
    if (!value || value === "default" || value === "guest") {
        throw new Error("A verified user identity is required for conversation memory.");
    }
    return value;

}


// ============================================
// GET USER CONVERSATION
// ============================================

function getUserConversation(userId) {

    userId = normalizeUserId(userId);

    if (!conversations.has(userId)) {

        conversations.set(
            userId,
            []
        );

    }

    return conversations.get(userId);

}


// ============================================
// ADD MESSAGE
// ============================================

function addMessage(
    userId,
    role,
    message
) {

    /*
     * Backward compatibility:
     *
     * Old:
     * addMessage(role, message)
     *
     * New:
     * addMessage(userId, role, message)
     */

    if (
        arguments.length === 2
    ) {

        message = role;
        role = userId;
        throw new Error("A verified user identity is required for conversation memory.");

    }


    message =
        cleanMessage(message);


    if (!message) {
        return false;
    }


    userId =
        normalizeUserId(userId);


    const conversation =
        getUserConversation(userId);

    const previous = conversation[conversation.length - 1];

    if (previous && previous.role === role && previous.message === message) {
        return false;
    }

    conversation.push({

        role,
        message,

        time:
            new Date()
                .toISOString()

    });


    // Keep latest messages only

    if (
        conversation.length >
        MAX_MESSAGES
    ) {

        conversation.splice(
            0,
            conversation.length - MAX_MESSAGES
        );

    }


    return true;

}




// Replace one chat's working memory from persisted chat history.
function replaceMemory(userId, messages) {
    userId = normalizeUserId(userId);
    const normalized = Array.isArray(messages)
        ? messages.slice(-MAX_MESSAGES).map(item => ({
            role: item.role === "assistant" ? "assistant" : "user",
            message: cleanMessage(item.message),
            time: item.time || new Date().toISOString()
        })).filter(item => item.message)
        : [];
    conversations.set(userId, normalized);
    return normalized;
}

// ============================================
// GET ALL MEMORY
// ============================================

function getMemory(userId) {

    return [
        ...getUserConversation(userId)
    ];

}


// ============================================
// GET RECENT
// ============================================

function getRecent(
    userId,
    limit = 10
) {

    /*
     * Backward compatibility:
     *
     * Old:
     * getRecent(10)
     *
     * New:
     * getRecent(userId, 10)
     */

    if (
        typeof userId === "number"
    ) {

        limit = userId;
        throw new Error("A verified user identity is required for conversation memory.");

    }


    limit =
        Math.max(
            1,
            Number(limit) || 10
        );


    const conversation =
        getUserConversation(userId);


    return conversation.slice(
        -limit
    );

}


// ============================================
// BUILD AI CONTEXT
// ============================================

function getContext(userId) {

    /*
     * Backward compatibility
     */

    const conversation =
        getUserConversation(userId);


    let context = "";


    conversation.forEach(chat => {

        context +=
            `${chat.role}: ${chat.message}\n`;

    });


    return context.trim();

}


// ============================================
// MESSAGE COUNT
// ============================================

function count(userId) {

    return getUserConversation(
        userId
    ).length;

}


// ============================================
// CLEAR USER MEMORY
// ============================================

function clearMemory(userId) {

    userId =
        normalizeUserId(userId);


    conversations.delete(
        userId
    );

}


// ============================================
// CLEAR ALL MEMORY
// ============================================

function clearAllMemory() {

    conversations.clear();

}


// ============================================
// EXPORTS
// ============================================

module.exports = {

    addMessage,

    replaceMemory,

    getMemory,

    getRecent,

    getContext,

    count,

    clearMemory,

    clearAllMemory

};
