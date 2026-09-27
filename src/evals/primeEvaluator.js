function normalize(text){return String(text||"").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();}
function relevance(question, answer){const q=new Set(normalize(question).split(" ").filter(w=>w.length>2));if(!q.size)return 1;const a=normalize(answer);let hit=0;for(const w of q)if(a.includes(w))hit++;return hit/q.size;}
function evaluateCase(testCase, answer){return {name:testCase.name,relevance:relevance(testCase.input,answer),containsAll:(testCase.mustContain||[]).every(v=>normalize(answer).includes(normalize(v)))};}
function summary(results){const valid=results.filter(Boolean);return {cases:valid.length,averageRelevance:valid.length?valid.reduce((n,x)=>n+x.relevance,0)/valid.length:0,passed:valid.filter(x=>x.containsAll && x.relevance>=0.25).length};}
module.exports={evaluateCase,summary};
