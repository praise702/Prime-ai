/*
 * ================================================
 * 🧠 Prime MEMORY CONTEXT ENGINE v3
 * ================================================
 *
 * Converts memory into useful AI context
 *
 * ================================================
 */

const memoryManager =
    require("./memoryManager");


// ================================================
// MEMORY QUESTION TYPE
// ================================================

function detectMemoryTopic(
    message
) {

    const text =
        String(message)
            .toLowerCase()
            .trim();


    if (
        text.includes("my name") ||
        text.includes("who am i")
    ) {

        return "name";

    }

    if (
        text.includes("what should you call me") ||
        text.includes("what do you call me") ||
        text.includes("how should you address me") ||
        text.includes("what should you address me as")
    ) {
        return "preferred_address";
    }


    if (
        text.includes("what do i like") ||
        text.includes("what do i enjoy") ||
        text.includes("what are my likes") ||
        text.includes("what things do i like")
    ) {

        return "likes";

    }


    if (
        text.includes("what do i love") ||
        text.includes("what are my loves") ||
        text.includes("who do i love") ||
        text.includes("who i love") ||
        text.includes("who will i love")
    ) {

        return "loves";

    }


    if (
        text.includes("what don't i like") ||
        text.includes("what do i dislike") ||
        text.includes("what are my dislikes")
    ) {

        return "dislikes";

    }


    if (
        text.includes("what color do i like") ||
        text.includes("what colour do i like") ||
        text.includes("favorite color") ||
        text.includes("favourite color") ||
        text.includes("favorite colour") ||
        text.includes("favourite colour")
    ) {

        return "favorite_color";

    }


    if (
        text.includes("my preferences") ||
        text.includes("what are my preferences") ||
        text.includes("what are my interests") ||
        text.includes("what are my hobbies")
    ) {

        return "preferences";

    }


    if (
        text.includes("what do you remember about me") ||
        text.includes("what do you know about me") ||
        text.includes("do you remember me") ||
        text.includes("my details") ||
        text.includes("what did i tell you") ||
        text.includes("what did i say earlier")
    ) {

        return "all";

    }


    return null;

}


// ================================================
// FIND RELEVANT MEMORY
// ================================================

function findRelevantMemory(
    userId,
    message
) {

    const memories =
        memoryManager.recall(
            userId
        );


    if (
        !memories ||
        Object.keys(memories).length === 0
    ) {

        return [];

    }


    const topic =
        detectMemoryTopic(
            message
        );


    const results = [];


    for (
        const key in memories
    ) {

        const memory =
            memories[key];


        if (
            !memory ||
            memory.value === undefined ||
            memory.value === null ||
            String(memory.value).trim() === ""
        ) {

            continue;

        }


        // =====================================
        // ALL MEMORY
        // =====================================

        if (
            topic === "all"
        ) {

            results.push({

                key,

                value:
                    memory.value,

                category:
                    memory.category,

                importance:
                    memory.importance

            });

            continue;

        }


        // =====================================
        // EXACT TOPIC
        // =====================================

        if (
            topic === key
        ) {

            results.push({

                key,

                value:
                    memory.value,

                category:
                    memory.category,

                importance:
                    memory.importance

            });

            continue;

        }


        // =====================================
        // PREFERENCE QUESTIONS
        // =====================================

        if (
            topic === "preferences" &&
            memory.category === "preference"
        ) {

            results.push({

                key,

                value:
                    memory.value,

                category:
                    memory.category,

                importance:
                    memory.importance

            });

            continue;

        }


    }


    return results;

}


// ================================================
// BUILD MEMORY CONTEXT
// ================================================

function buildMemoryContext(
    userId,
    message
) {

    const memories =
        findRelevantMemory(
            userId,
            message
        );


    if (
        memories.length === 0
    ) {

        return "";

    }


    let context = "";


    memories.forEach(
        memory => {

            if (
                memory.key === "name"
            ) {

                context +=
                    `Your name is ${memory.value}.\n`;

            }

            else if (
                memory.key === "likes"
            ) {

                context +=
                    `You like ${memory.value}.\n`;

            }

            else if (
                memory.key === "loves"
            ) {

                context +=
                    `You love ${memory.value}.\n`;

            }

            else if (
                memory.key === "dislikes"
            ) {

                context +=
                    `You don't like ${memory.value}.\n`;

            }

            else if (
                memory.key === "favorite_color"
            ) {

                context +=
                    `Your favorite color is ${memory.value}.\n`;

            }

            else if (memory.key === "preferred_address") {
                context += `You prefer to be addressed as ${memory.value}.\n`;
            }

            else {

                context +=
                    `${memory.key.replace(/_/g, " ")}: ${memory.value}.\n`;

            }

        }
    );


    return context.trim();

}




function buildProfileContext(userId) {
    const memories = memoryManager.recall(userId) || {};
    const important = Object.entries(memories)
        .filter(([, memory]) => memory && memory.value !== undefined && memory.value !== null && String(memory.value).trim())
        .sort((a, b) => Number(b[1]?.importance || 0) - Number(a[1]?.importance || 0))
        .slice(0, 12);

    return important.map(([key, memory]) => {
        const label = key.replace(/_/g, " ");
        return `${label}: ${String(memory.value).trim()}`;
    }).join("\n");
}

// ================================================
// EXPORTS
// ================================================

module.exports = {

    findRelevantMemory,

    buildMemoryContext,

    detectMemoryTopic,

    buildProfileContext

};
