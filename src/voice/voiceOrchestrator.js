const axios = require("axios");
function speechService(){return String(process.env.PRIME_VOICE_SERVICE_URL||"").trim();}
async function transcribe(audioBase64, filename="audio.webm"){const url=speechService();if(!url)return null;try{const r=await axios.post(`${url.replace(/\/$/,"")}/transcribe`,{audio:audioBase64,filename},{timeout:120000});return r.data||null;}catch{return null;}}
async function synthesize(text,style="friendly"){const url=speechService();if(!url)return null;try{const r=await axios.post(`${url.replace(/\/$/,"")}/synthesize`,{text,style},{timeout:120000});return r.data||null;}catch{return null;}}
async function analyzeEmotion(audioBase64){const url=speechService();if(!url)return null;try{const r=await axios.post(`${url.replace(/\/$/,"")}/emotion`,{audio:audioBase64},{timeout:120000});return r.data||null;}catch{return null;}}
module.exports={transcribe,synthesize,analyzeEmotion,enabled:()=>Boolean(speechService())};
