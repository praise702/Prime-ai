/*
================================================
🧠 Prime SOURCE RANKER v1.0
================================================

Features:

✅ Source trust scoring
✅ Query-based ranking
✅ Duplicate filtering
✅ Quality checking
✅ AI knowledge preparation

================================================
*/



// ==============================================
// SOURCE TRUST DATABASE
// ==============================================


const sourceTrust = {


    wikipedia:90,

    arxiv:95,

    openalex:95,

    wikibooks:80,


    britannica:90,

    nature:95,

    science:95,

    unknown:40


};








// ==============================================
// GET SOURCE NAME
// ==============================================


function getSourceName(item){


    if(item.source)

        return item.source.toLowerCase();



    if(item.url){


        const url =

        item.url.toLowerCase();



        if(url.includes("wikipedia"))

            return "wikipedia";



        if(url.includes("arxiv"))

            return "arxiv";



        if(url.includes("openalex"))

            return "openalex";



        if(url.includes("britannica"))

            return "britannica";


    }



    return "unknown";


}









// ==============================================
// BASE SCORE
// ==============================================


function sourceScore(item){


    const name =

    getSourceName(item);



    let score =

    sourceTrust[name] || 40;





    if(item.text){


        if(item.text.length>500)

            score+=10;



        if(item.text.length<100)

            score-=10;


    }





    if(item.title)

        score+=5;



    if(item.url)

        score+=5;





    return Math.min(

        100,

        score

    );


}









// ==============================================
// QUERY MATCHING
// ==============================================


function queryBoost(item,query){


    const text =

    (

        item.title+

        " "+

        item.text

    )

    .toLowerCase();




    const q=

    query.toLowerCase();




    let boost=0;




    const words=q.split(" ");





    words.forEach(word=>{


        if(

            word.length>3 &&

            text.includes(word)

        )

            boost+=2;



    });




    return boost;


}









// ==============================================
// RANK RESULTS
// ==============================================


function rankSources(results,query){


    if(!results)

        return [];





    return results

    .map(item=>{


        return {


            ...item,


            rankScore:

            sourceScore(item)

            +

            queryBoost(item,query)


        };


    })



    .sort((a,b)=>{


        return b.rankScore-a.rankScore;


    })



    .slice(0,10);



}









// ==============================================
// REMOVE DUPLICATES
// ==============================================


function removeDuplicateSources(results){


    const used=new Set();



    return results.filter(item=>{


        const key=

        (

            item.title ||

            item.text

        )

        .toLowerCase()

        .substring(0,80);




        if(used.has(key))

            return false;



        used.add(key);



        return true;


    });


}









// ==============================================
// FINAL RANK FUNCTION
// ==============================================


function rankKnowledge(results,query){



    let ranked=

    rankSources(results,query);



    ranked=

    removeDuplicateSources(ranked);





    console.log(

        "🏆 Source ranking complete"

    );





    return ranked;


}









module.exports={


    rankKnowledge,

    sourceScore

};