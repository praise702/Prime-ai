function parseWordnet(raw, word){


    if(!raw){
        return null;
    }


    const parts =
    raw.split("|");


    let definition =
    "";


    if(parts.length > 1){

        definition =
        parts[1]
        .trim();

    }



    return {


        word: word,


        meaning:
        definition,


        source:
        "WordNet"


    };


}



module.exports = {

    parseWordnet

};