/*
============================================
🧠 Prime REASONING ENGINE v15
============================================

FEATURES:

✅ Question Understanding
✅ Intent Analysis
✅ Answer Strategy
✅ Memory Detection
✅ Current Information Detection
✅ Research Detection
✅ Comparison Detection
✅ Explanation Detection
✅ Math Detection
✅ Identity Detection
✅ Tool Planning

============================================
*/





function analyze(question=""){



const q =

String(question)

.toLowerCase()

.trim();







const result = {


type:"general",


goal:"answer",


strategy:"knowledge",


needsSearch:false,


needsMemory:false,


responseStyle:"normal",


confidence:50


};









// ========================================
// EMPTY
// ========================================


if(!q){


result.type="empty";

result.confidence=0;


return result;


}









// ========================================
// MEMORY
// ========================================


if(


q.includes("my name") ||


q.includes("remember") ||


q.includes("what do you know about me") ||


q.includes("who am i")

){


result.type="memory";


result.goal="memory operation";


result.strategy="memory system";


result.needsMemory=true;


result.responseStyle="personal";


result.confidence=95;



return result;


}









// ========================================
// IDENTITY
// ========================================


if(


q.includes("who developed") ||


q.includes("who created") ||


q.includes("who made") ||


q.includes("who built")

){


result.type="identity";


result.goal="find creator";


result.strategy="identity lookup";


result.confidence=95;



return result;


}









// ========================================
// MATH
// ========================================


if(


/\d/.test(q)

&&

(

q.includes("+") ||

q.includes("-") ||

q.includes("*") ||

q.includes("/") ||

q.includes("multiply") ||

q.includes("divide") ||

q.includes("calculate")

)

){



result.type="math";


result.goal="calculate";


result.strategy="math engine";


result.responseStyle="short";


result.confidence=100;



return result;


}









// ========================================
// CURRENT INFORMATION
// ========================================


if(


q.includes("current") ||


q.includes("latest") ||


q.includes("today") ||


q.includes("now") ||


q.includes("recent")

){



result.type="current";


result.goal="find latest information";


result.strategy="external knowledge";


result.needsSearch=true;


result.responseStyle="latest";


result.confidence=95;



return result;


}









// ========================================
// RESEARCH
// ========================================


if(


q.includes("research") ||


q.includes("paper") ||


q.includes("study") ||


q.includes("experiment") ||


q.includes("scientific")

){



result.type="research";


result.goal="collect scientific information";


result.strategy="research sources";


result.needsSearch=true;


result.responseStyle="detailed";


result.confidence=90;



return result;


}









// ========================================
// LIST
// ========================================


if(


q.includes("points") ||


q.includes("point by point") ||


q.includes("list") ||


q.includes("types") ||


q.includes("examples")

){


result.type="list";


result.goal="structured information";


result.strategy="bullet format";


result.responseStyle="organized";


result.confidence=90;



return result;


}









// ========================================
// EXPLANATION
// ========================================


if(


q.includes("explain") ||


q.includes("how") ||


q.includes("why") ||


q.includes("describe")

){



result.type="explanation";


result.goal="teach concept";


result.strategy="step explanation";


result.responseStyle="teaching";


result.confidence=90;



return result;


}









// ========================================
// COMPARISON
// ========================================


if(


q.includes("compare") ||


q.includes("difference") ||


q.includes("vs") ||


q.includes("versus")

){



result.type="comparison";


result.goal="compare topics";


result.strategy="comparison table";


result.responseStyle="comparison";


result.confidence=90;



return result;


}









// ========================================
// DEFINITION
// ========================================


if(


q.startsWith("what is") ||


q.startsWith("what are") ||


q.startsWith("define") ||


q.startsWith("who is")

){



result.type="definition";


result.goal="define topic";


result.strategy="knowledge retrieval";


result.needsSearch=true;


result.responseStyle="factual";


result.confidence=85;



return result;


}









// ========================================
// GENERAL
// ========================================


result.type="general";


result.goal="search knowledge";


result.strategy="knowledge retrieval";


result.needsSearch=true;


result.confidence=60;



return result;



}








module.exports={


analyze


};