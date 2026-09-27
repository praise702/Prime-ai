const axios = require("axios");

function base(){return String(process.env.QDRANT_URL||"").trim().replace(/\/$/,"");}
function collection(){return String(process.env.QDRANT_COLLECTION||"prime_memory").trim()||"prime_memory";}
function enabled(){return Boolean(base());}
async function ensureCollection(vectorSize){if(!enabled()||!Number.isInteger(vectorSize)||vectorSize<1)return false;try{const url=`${base()}/collections/${encodeURIComponent(collection())}`;const existing=await axios.get(url,{timeout:5000,validateStatus:s=>s>=200&&s<500});if(existing.status===200)return true;await axios.put(url,{vectors:{size:vectorSize,distance:"Cosine"}},{timeout:10000});return true;}catch{return false;}}
async function upsert(point){if(!enabled()||!Array.isArray(point?.vector))return false;try{await ensureCollection(point.vector.length);await axios.put(`${base()}/collections/${encodeURIComponent(collection())}/points`,{points:[point]},{timeout:10000});return true;}catch{return false;}}
async function search(vector,limit=6){if(!enabled()||!Array.isArray(vector))return [];try{const r=await axios.post(`${base()}/collections/${encodeURIComponent(collection())}/points/search`,{vector,limit,with_payload:true,with_vectors:false},{timeout:10000});return Array.isArray(r.data?.result)?r.data.result:[];}catch{return [];}}
module.exports={enabled,upsert,search,collection};
