/**
 * ==========================================
 * 🚀 Prime FULL BRAIN SYSTEM TEST v2
 * ==========================================
 *
 * Tests:
 * - Brain Router
 * - Knowledge Engine
 * - Knowledge Fusion
 * - Answer Generator
 * - Search Decision
 *
 * ==========================================
 */


const brain =
require("./brainRouter");


const { processMessage } =
require("./brain");





console.log(
`
🚀 Prime FULL BRAIN TEST

================================
`
);






const questions = [

    "What is gravity?",

    "What is artificial intelligence?",

    "Explain black holes",

    "What is the latest NVIDIA GPU?",

    "Who won today's match?"

];








async function runTest(){



    for(const question of questions){



        console.log(
`
--------------------------------
Question:
${question}
`
        );





        // Brain decision

        const decision =
        brain.analyzeQuestion(
            question
        );




        console.log(
`
🧠 BRAIN DECISION:

Route:
${decision.route}

Reason:
${decision.reason}
`
        );








        // Only process internal knowledge

        if(
            decision.route ===
            "knowledge-engine"
        ){



            console.log(
`
📚 SEARCHING Prime KNOWLEDGE...
`
            );



            const answer =
            await processMessage(
                question
            );



            console.log(
`
🧠 Prime ANSWER:

${answer}
`
            );



        }






        else{


            console.log(
`
🌐 LIVE SEARCH REQUIRED

Prime will use external knowledge.
`
            );


        }





    }





    console.log(
`
================================

🚀 Prime TEST COMPLETE

================================
`
    );




}






runTest();