/**
 * ================================================
 * 🧠 Prime MEMORY MANAGER v8.2
 * ================================================
 *
 * Features:
 * ✅ Long-term memory
 * ✅ User-specific short-term memory
 * ✅ Name memory
 * ✅ Likes
 * ✅ Loves
 * ✅ Dislikes
 * ✅ Favorite color
 * ✅ Favorite/favourite
 * ✅ Fav/fave
 * ✅ Color/colour
 * ✅ Custom facts
 * ✅ Memory updates
 * ================================================
 */

const shortMemory = require("./shortMemory");
const longMemory = require("./longMemory");


// ================================================
// SAVE LONG-TERM MEMORY
// ================================================

function remember(
    userId,
    key,
    value,
    category = "general",
    importance = 5
) {
    const existing = longMemory.getMemory(userId);

    // Prevent exact duplicate
    if (
        existing &&
        existing[key] &&
        existing[key].value === value
    ) {
        return {
            saved: false,
            message: "Memory already exists."
        };
    }

    longMemory.saveMemory(
        userId,
        key,
        value,
        category,
        importance
    );

    return {
        saved: true,
        key,
        value,
        category,
        importance
    };
}


// ================================================
// GET LONG-TERM MEMORY
// ================================================

function recall(userId) {
    return longMemory.getMemory(userId);
}


// ================================================
// ADD CONVERSATION
// ================================================

function addConversation(
    userId,
    role,
    message
) {
    return shortMemory.addMessage(
        userId,
        role,
        message
    );
}


// ================================================
// GET FULL CONVERSATION
// ================================================

function getConversation(userId) {
    return shortMemory.getMemory(userId);
}


// ================================================
// GET RECENT CONVERSATION
// ================================================

function getRecentConversation(
    userId,
    limit = 10
) {
    return shortMemory.getRecent(
        userId,
        limit
    );
}


// ================================================
// GET CONVERSATION CONTEXT
// ================================================

function getConversationContext(userId) {
    return shortMemory.getContext(userId);
}


// ================================================
// AUTO MEMORY DETECTION
// ================================================

function detectMemory(
    message,
    userId
) {
    const original = String(message).trim();

    if (!original) {
        return null;
    }

    // ================================================
    // PREFERRED ADDRESS / NICKNAME
    // ================================================
    const addressMatch = original.match(
        /^(?:from now(?: on)?[ ,]*)?(?:please\s+)?(?:call|address)\s+me\s+(?:as\s+)?(.+?)\s*[.!?]*$/i
    );

    if (addressMatch) {
        const preferred = addressMatch[1].trim();
        if (preferred) {
            remember(userId, "preferred_address", preferred, "preference", 9);
            return { saved: true, message: `Got it — I'll call you ${preferred}.` };
        }
    }

// ================================================
// NAME
// ================================================

    const nameMatch = original.match(
        /^my\s+name\s+is\s+(.+?)\s*[.!?]*$/i
    );

    if (nameMatch) {
        const name = nameMatch[1].trim();

        if (!name) {
            return null;
        }

        remember(
            userId,
            "name",
            name,
            "personal",
            10
        );

        return {
            saved: true,
            message:
                `Nice to meet you, ${name}! I will remember your name.`
        };
    }


// ================================================
// FAVORITE COLOR
//
// Supports:
//
// my favorite color is blue
// my favourite color is blue
// my favorite colour is blue
// my favourite colour is blue
// my fav color is blue
// my fav colour is blue
// my fave color is blue
// my fave colour is blue
// ================================================

    const favoriteColorMatch = original.match(
        /^my\s+(?:favorite|favourite|fav|fave)\s+(?:color|colour)\s+is\s+(.+?)\s*[.!?]*$/i
    );

    if (favoriteColorMatch) {
        const color = favoriteColorMatch[1].trim();

        if (!color) {
            return null;
        }

        remember(
            userId,
            "favorite_color",
            color,
            "preference",
            8
        );

        return {
            saved: true,
            message:
                `I will remember that your favourite color is ${color}.`
        };
    }


// ================================================
// LIKE
// ================================================

    const likeMatch = original.match(
        /^i\s+like\s+(.+?)\s*[.!?]*$/i
    );

    if (likeMatch) {
        const value = likeMatch[1].trim();

        if (!value) {
            return null;
        }

        remember(
            userId,
            "likes",
            value,
            "preference",
            8
        );

        return {
            saved: true,
            message:
                `I will remember that you like ${value}.`
        };
    }


// ================================================
// LOVE
// ================================================

    const loveMatch = original.match(
        /^i\s+love\s+(.+?)\s*[.!?]*$/i
    );

    if (loveMatch) {
        const value = loveMatch[1].trim();

        if (!value) {
            return null;
        }

        remember(
            userId,
            "loves",
            value,
            "preference",
            8
        );

        return {
            saved: true,
            message:
                `I will remember that you love ${value}.`
        };
    }


// ================================================
// DON'T LIKE
// ================================================

    const dontLikeMatch = original.match(
        /^i\s+don't\s+like\s+(.+?)\s*[.!?]*$/i
    );

    if (dontLikeMatch) {
        const value = dontLikeMatch[1].trim();

        if (!value) {
            return null;
        }

        remember(
            userId,
            "dislikes",
            value,
            "preference",
            8
        );

        return {
            saved: true,
            message:
                `I will remember that you don't like ${value}.`
        };
    }


// ================================================
// DISLIKE
// ================================================

    const dislikeMatch = original.match(
        /^i\s+dislike\s+(.+?)\s*[.!?]*$/i
    );

    if (dislikeMatch) {
        const value = dislikeMatch[1].trim();

        if (!value) {
            return null;
        }

        remember(
            userId,
            "dislikes",
            value,
            "preference",
            8
        );

        return {
            saved: true,
            message:
                `I will remember that you don't like ${value}.`
        };
    }


// ================================================
// REMEMBER THAT
// ================================================

    const rememberMatch = original.match(
        /^remember\s+that\s+(.+?)\s*[.!?]*$/i
    );

    if (rememberMatch) {
        const fact = rememberMatch[1].trim();

        if (!fact) {
            return null;
        }

        remember(
            userId,
            "fact_" + Date.now(),
            fact,
            "custom",
            6
        );

        return {
            saved: true,
            message:
                "I saved that information."
        };
    }


// ================================================
// USER PROFILE
// ================================================

    const profileMatch = original.match(
        /^i\s+am\s+a\s+(.+?)\s*[.!?]*$/i
    );

    if (profileMatch) {
        const detail = profileMatch[1].trim();

        if (!detail) {
            return null;
        }

        remember(
            userId,
            "profile",
            detail,
            "personal",
            7
        );

        return {
            saved: true,
            message:
                `I will remember that you are ${detail}.`
        };
    }


// ================================================
// NOTHING DETECTED
// ================================================

    return null;
}


// ================================================
// EXPORTS
// ================================================

module.exports = {
    remember,
    recall,
    addConversation,
    getConversation,
    getRecentConversation,
    getConversationContext,
    detectMemory
};
