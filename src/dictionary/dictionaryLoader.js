/**
 * ============================================
 * 📚 Prime DICTIONARY LOADER v1
 * ============================================
 *
 * Loads A-Z vocabulary database
 *
 * Features:
 * ✅ 100000+ word support
 * ✅ Cache system
 * ✅ Fast loading
 *
 * ============================================
 */


const fs = require("fs");
const path = require("path");


let dictionaryCache = null;



function loadDictionary(){


    if(dictionaryCache){

        return dictionaryCache;

    }



    dictionaryCache = [];



    const folder =
    path.join(
        __dirname,
        "dictionaryData"
    );



    const letters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ";



    for(const letter of letters){


        const file =
        path.join(
            folder,
            `${letter}.json`
        );



        if(
            fs.existsSync(file)
        ){


            try{


                const words =
                JSON.parse(

                    fs.readFileSync(
                        file,
                        "utf8"
                    )

                );



                dictionaryCache.push(
                    ...words
                );



                console.log(
                    `Loaded ${letter}.json : ${words.length} words`
                );



            }

            catch(error){


                console.log(
                    "Dictionary loading error:",
                    letter
                );


            }


        }



    }



    console.log(
        "📚 Total Dictionary Words:",
        dictionaryCache.length
    );



    return dictionaryCache;


}





function clearDictionaryCache(){

    dictionaryCache = null;

}





module.exports={

    loadDictionary,
    clearDictionaryCache

};