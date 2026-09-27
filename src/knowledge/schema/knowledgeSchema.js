/**
 * ============================================
 * 🧠 Prime KNOWLEDGE SCHEMA v1
 * ============================================
 *
 * Converts simple facts into intelligent knowledge
 *
 * ============================================
 */


function createKnowledgeItem({

    fact,

    topic,

    category="general",

    type="concept",

    difficulty="beginner",

    examples=[],

    related=[],

    importance=3


}){


    return {


        id:

        Date.now().toString(),



        fact,



        topic,



        category,



        type,



        difficulty,



        examples,



        related,



        importance,



        created:

        new Date().toISOString()


    };


}






function validateKnowledge(item){


    if(!item.fact)
        return false;


    if(!item.topic)
        return false;


    return true;


}







module.exports={

    createKnowledgeItem,

    validateKnowledge

};