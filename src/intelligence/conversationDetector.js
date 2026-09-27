/*
========================================
🚀 Prime CONVERSATION DETECTOR v3
========================================
*/


// ========================================
// HUMAN / EMOTIONAL CONVERSATION
// ========================================
// These are handled locally so simple human moments never become web searches
// or generic "not enough information" answers when the model is unavailable.

function emotionalReply(text) {

    const sad = /^(?:i(?:'m| am|m)\s+|i\s+feel(?:ing)?\s+|feeling\s+|really\s+|very\s+)?(?:sad|down|upset|hurt|heartbroken|miserable|depressed)\b(?:\s+bro)?(?:\s+please)?$/i;
    const lonely = /\b(?:i(?:'m| am)\s+)?(?:lonely|alone|feeling alone)\b/i;
    const stressed = /\b(?:i(?:'m| am)|i feel|feeling)\s+(?:really\s+|very\s+)?(?:stressed|overwhelmed|burnt out|burned out|exhausted)\b/i;
    const angry = /\b(?:i(?:'m| am)|i feel|feeling)\s+(?:really\s+|very\s+)?(?:angry|mad|frustrated|annoyed)\b/i;
    const worried = /\b(?:i(?:'m| am)|i feel|feeling)\s+(?:really\s+|very\s+)?(?:worried|scared|afraid|nervous|anxious)\b/i;
    const tired = /\b(?:i(?:'m| am)|i feel|feeling)\s+(?:really\s+)?(?:tired|sleepy|worn out)\b/i;
    const bored = /\b(?:i(?:'m| am)|i feel|feeling)\s+(?:really\s+)?bored\b/i;
    const happy = /\b(?:i(?:'m| am)|i feel|feeling)\s+(?:really\s+)?(?:happy|great|awesome|excited|proud)\b/i;
    const notOkay = /^(?:i(?:'m| am)\s+)?(?:not okay|not ok|having a bad day|having a rough day)\.?$/i;
    const howAreYou = /^(?:how are you|how're you|how are u)\??$/i;

    if (howAreYou.test(text)) {
        return "I'm doing well, bro 😄 I'm here with you. What's up?";
    }
    if (sad.test(text) || notOkay.test(text)) {
        return "I'm sorry you're feeling that way, bro. I'm here with you. You don't have to explain everything at once — tell me what happened, and we'll take it one step at a time.";
    }
    if (lonely.test(text)) {
        return "I'm here with you, bro. You don't have to carry the whole feeling by yourself right now. Want to tell me what's going on?";
    }
    if (stressed.test(text)) {
        return "That sounds like a lot, bro. Let's slow it down and take it one thing at a time. Tell me what's putting the most pressure on you right now.";
    }
    if (angry.test(text)) {
        return "Yeah, bro, that sounds frustrating. Tell me what happened — we can work through it without rushing.";
    }
    if (worried.test(text)) {
        return "I hear you, bro. It's okay to take this one step at a time. Tell me what you're worried about and I'll help you think it through.";
    }
    if (tired.test(text)) {
        return "Sounds like you're worn out, bro. Take a breath and slow down for a moment. What's been draining you?";
    }
    if (bored.test(text)) {
        return "Bored, bro? 😄 I'm here. We can chat, play something, learn something, or work on one of your projects.";
    }
    if (happy.test(text)) {
        return "That's awesome, bro! 😄 I'm glad you're feeling good. What happened?";
    }

    return null;
}



function detect(message){


const text =
message
.toLowerCase()
.trim()
.replace(/[!?.,]+$/g,"");



const emotional = emotionalReply(text);
if (emotional) {

return {
matched: true,
type: "emotional",
reply: emotional
};

}


// greetings

if(

[
"hi",
"hii",
"hiii",
"hello",
"hey",
"hai",
"good morning",
"good afternoon",
"good evening",
"good night"

].includes(text)

){


return {

matched:true,

type:"greeting",

reply:
text === "good night"
? "Good night. Rest well — I’ll be here when you need me."
: "Hi! What would you like to work on?"


};


}






// casual bro


if(

[
"bro",
"br0",
"broo",
"dude",
"buddy"

].includes(text)

){


return {


matched:true,


type:"casual",


reply:
"Yeah bro 😄 What's up? How can I help you?"


};


}






// thanks


if(

[
"thanks",
"thank you",
"thx"

].includes(text)

){


return {


matched:true,


type:"thanks",


reply:
"You’re welcome — happy to help."


};


}


if(
[
"thanks bro",
"thank you bro",
"thanks buddy",
"thank you buddy"
].includes(text)
){

return {

matched:true,

type:"thanks",

reply:
"You’re welcome — happy to help."

};

}


if(
[
"what's up",
"whats up",
"sup"
].includes(text)
){

return {

matched:true,

type:"casual",

reply:
"Not much — I’m here and ready to help. What’s on your mind?"

};

}







// bye


if(

[
"bye",
"goodbye",
"see you"

].includes(text)

){


return {


matched:true,


type:"bye",


reply:
"Goodbye bro 👋 Have a great day!"


};


}




return {


matched:false


};


}





module.exports={

detect,
emotionalReply

};
