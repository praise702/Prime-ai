const fs = require("fs");
const path = require("path");


const trainingFile = path.join(
    __dirname,
    "../trainingData.json"
);


function trainModel(){

    console.log("\n🧠 Prime TRAINING STARTED\n");


    if(!fs.existsSync(trainingFile)){

        console.log(
            "❌ trainingData.json not found"
        );

        return [];

    }


    const trainingData = JSON.parse(
        fs.readFileSync(
            trainingFile,
            "utf-8"
        )
    );


    console.log(
        `📚 Loaded ${trainingData.length} training examples\n`
    );


    const knowledge = [];


    trainingData.forEach((item)=>{


        console.log(
            "Learning:",
            item.question
        );


        knowledge.push({

            question:
            item.question.toLowerCase(),

            answer:
            item.answer,

            topic:
            item.topic

        });


    });


    console.log(
        "\n✅ Prime TRAINING COMPLETE\n"
    );


    return knowledge;

}


module.exports = trainModel;