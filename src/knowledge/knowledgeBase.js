const fs = require("fs");
const path = require("path");


const filePath = path.join(
    __dirname,
    "../../data/knowledge.json"
);


function loadKnowledge() {

    return JSON.parse(
        fs.readFileSync(filePath, "utf8")
    );

}


function saveKnowledge(key, value) {

    const data = loadKnowledge();

    data[key] = value;


    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 4)
    );

}


function getKnowledge(key) {

    const data = loadKnowledge();

    return data[key] || null;

}


module.exports = {
    saveKnowledge,
    getKnowledge,
    loadKnowledge
};