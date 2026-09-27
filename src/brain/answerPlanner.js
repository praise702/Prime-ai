function planAnswer(facts, question) {

    return facts.sort((a, b) => {

        function getPriority(item) {

            const text = item.fact.answer.toLowerCase();

            let priority = 0;


            // Definition
            if (
                text.includes("is a force") ||
                text.includes("is a") ||
                text.includes("are")
            ) {
                priority += 100;
            }


            // Main effects
            if (
                text.includes("keeps") ||
                text.includes("causes") ||
                text.includes("creates") ||
                text.includes("allows")
            ) {
                priority += 80;
            }


            // Common examples
            if (
                text.includes("planet") ||
                text.includes("orbit") ||
                text.includes("stars")
            ) {
                priority += 70;
            }


            // Advanced science
            if (
                text.includes("dark matter") ||
                text.includes("light")
            ) {
                priority += 30;
            }


            // Keep ranking score influence
            priority += item.score * 10;


            return priority;
        }


        return getPriority(b) - getPriority(a);

    });

}


module.exports = {
    planAnswer
};