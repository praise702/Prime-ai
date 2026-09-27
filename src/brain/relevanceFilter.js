function calculateAnswerRelevance(fact, question){


    const qWords =
    question
    .toLowerCase()
    .split(/\s+/);


    const text =
    (
        fact.question +
        " " +
        fact.answer
    )
    .toLowerCase();



    let score = 0;


    for(const word of qWords){

        if(
            word.length > 3 &&
            text.includes(word)
        ){

            score++;

        }

    }


    return score;

}





function filterRelevantFacts(results, question){


    return results
    .map(item=>({

        ...item,

        relevance:
        calculateAnswerRelevance(
            item.fact,
            question
        )

    }))


    .sort(
        (a,b)=>
        b.relevance-a.relevance
    )

    .slice(0,3);


}



module.exports = {
    filterRelevantFacts
};