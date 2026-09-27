const fs = require("fs");
const path = require("path");
const config = require("../config/config");
const memoryFile = path.join(config.dataDir, "vision-memory.json");
let db = null;
function load(){ if(db) return db; try{db=JSON.parse(fs.readFileSync(memoryFile,"utf8"));}catch{db={};} return db; }
function save(){fs.mkdirSync(path.dirname(memoryFile),{recursive:true});fs.writeFileSync(memoryFile,JSON.stringify(db,null,2));}
function remember(userId, attachment, description){if(!userId||!attachment)return;const s=load();s[userId]=s[userId]||[];s[userId].push({attachment,description,createdAt:new Date().toISOString()});s[userId]=s[userId].slice(-20);save();}
function recent(userId){return (load()[userId]||[]).slice(-5);}
module.exports={remember,recent};
