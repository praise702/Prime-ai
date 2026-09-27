/*
============================================
🧠 Prime CATEGORY DETECTOR v14
============================================

FEATURES:

✅ Smart topic detection
✅ Multiple categories
✅ Better knowledge routing
✅ Science detection
✅ AI detection
✅ Programming detection
✅ Cybersecurity detection
✅ General fallback

============================================
*/



function detectCategory(message){


if(
!message ||
typeof message !== "string"
){


return {


primaryCategory:"general",

secondaryCategories:[]

};


}



const text =
message
.toLowerCase()
.trim();




let primary =
"general";


let secondary=[];







// ========================================
// ARTIFICIAL INTELLIGENCE
// ========================================


if(

text.includes("ai")
||
text.includes("artificial intelligence")
||
text.includes("machine learning")
||
text.includes("deep learning")
||
text.includes("neural network")
||
text.includes("chatgpt")
||
text.includes("gemini")
||
text.includes("llm")

){


primary="artificial_intelligence";


secondary.push(
"technology",
"computer_science"
);


}








// ========================================
// COMPUTER SCIENCE
// ========================================


else if(

text.includes("computer")
||
text.includes("programming")
||
text.includes("javascript")
||
text.includes("python")
||
text.includes("node")
||
text.includes("software")
||
text.includes("algorithm")
||
text.includes("coding")

){


primary="computer_science";


secondary.push(
"technology"
);


}









// ========================================
// CYBERSECURITY
// ========================================


else if(

text.includes("hack")
||
text.includes("hacking")
||
text.includes("virus")
||
text.includes("malware")
||
text.includes("firewall")
||
text.includes("security")
||
text.includes("encryption")
||
text.includes("password")

){


primary="cybersecurity";


secondary.push(
"computer_science",
"technology"
);


}









// ========================================
// PHYSICS
// ========================================


else if(

text.includes("physics")
||
text.includes("force")
||
text.includes("energy")
||
text.includes("gravity")
||
text.includes("motion")
||
text.includes("speed")
||
text.includes("light")
||
text.includes("electricity")

){


primary="physics";


secondary.push(
"science"
);


}









// ========================================
// CHEMISTRY
// ========================================


else if(

text.includes("chemistry")
||
text.includes("chemical")
||
text.includes("atom")
||
text.includes("molecule")
||
text.includes("element")
||
text.includes("reaction")

){


primary="chemistry";


secondary.push(
"science"
);


}









// ========================================
// BIOLOGY
// ========================================


else if(

text.includes("biology")
||
text.includes("cell")
||
text.includes("dna")
||
text.includes("animal")
||
text.includes("plant")
||
text.includes("human body")
||
text.includes("organ")

){


primary="biology";


secondary.push(
"science"
);


}









// ========================================
// MATHEMATICS
// ========================================


else if(

text.includes("math")
||
text.includes("calculate")
||
text.includes("equation")
||
text.includes("number")
||
text.includes("algebra")
||
text.includes("geometry")
||
text.includes("formula")

){


primary="mathematics";


secondary.push(
"science"
);


}









// ========================================
// ASTRONOMY
// ========================================


else if(

text.includes("space")
||
text.includes("planet")
||
text.includes("star")
||
text.includes("galaxy")
||
text.includes("black hole")
||
text.includes("universe")

){


primary="astronomy";


secondary.push(
"physics",
"science"
);


}









// ========================================
// ENGINEERING
// ========================================


else if(

text.includes("robot")
||
text.includes("engineering")
||
text.includes("machine")
||
text.includes("mechanical")
||
text.includes("electronic")

){


primary="engineering";


secondary.push(
"technology",
"science"
);


}









// ========================================
// TECHNOLOGY
// ========================================


else if(

text.includes("technology")
||
text.includes("device")
||
text.includes("phone")
||
text.includes("computer")

){


primary="technology";


}









return {


primaryCategory:primary,


secondaryCategories:
secondary,


confidence:

primary==="general"
?
0.5
:
0.9



};



}









// Backward compatibility

function detect(message){


return detectCategory(message);


}







module.exports={


detectCategory,

detect


};