const {

createKnowledgeItem,

validateKnowledge

}=require("./knowledgeSchema");





const gravity = createKnowledgeItem({

fact:
"Gravity is a force that attracts objects with mass.",


topic:
"Gravity",


category:
"Physics",


type:
"concept",


difficulty:
"beginner",


examples:[

"Objects falling to Earth",

"Planets orbiting the Sun"

],


related:[

"Mass",

"Force",

"Newton's laws"

],


importance:5


});





console.log(gravity);



console.log(

"Valid:",

validateKnowledge(gravity)

);