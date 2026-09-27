/**
 * ============================================
 * 🧠 Prime LONG TERM MEMORY v6
 * ============================================
 *
 * Features:
 *
 * ✅ Permanent JSON storage
 * ✅ Multi-user memory
 * ✅ Memory update
 * ✅ Duplicate protection
 * ✅ Importance ranking
 * ✅ Memory search
 * ✅ Delete memory
 * ✅ Clear user memory
 * ✅ Safe loading
 *
 * ============================================
 */


const fs =
require("fs");


const path =
require("path");

const config =
require("../config/config");





// ============================================
// MEMORY FILE
// ============================================


const filePath = path.join(config.dataDir, "memory.json");

function normalizeUserId(userId){
    const value = String(userId || "").trim();
    if (!value || value === "default" || value === "guest" || value === "__proto__" || value === "constructor") {
        throw new Error("A verified user identity is required for memory.");
    }
    return value;
}









// ============================================
// LOAD MEMORY
// ============================================


function loadMemory(){


try{


if(!fs.existsSync(filePath)){


return {

users:{}

};


}





const data =

fs.readFileSync(

filePath,

"utf8"

);





return JSON.parse(data);



}

catch(error){


console.log(

"⚠️ Memory load error:",

error.message

);



return {

users:{}

};



}


}









// ============================================
// SAVE FILE
// ============================================


function saveFile(data){



try{



fs.writeFileSync(

filePath,

JSON.stringify(

data,

null,

4

)

);



}

catch(error){


console.log(

"⚠️ Memory save error:",

error.message

);


}


}









// ============================================
// SAVE MEMORY
// ============================================


function saveMemory(

userId,

key,

value,

category="general",

importance=5

){

userId = normalizeUserId(userId);



const data =

loadMemory();






if(!data.users[userId]){


data.users[userId]={

memories:{}

};


}







const oldMemory =

data.users[userId]

.memories[key];







// Upgrade importance if repeated


let finalImportance =

importance;



if(oldMemory){


finalImportance =

Math.max(

oldMemory.importance || 0,

importance

);


}







data.users[userId]

.memories[key]={



value,


category,


importance:

finalImportance,


updated:

new Date()

.toISOString()



};








saveFile(data);




console.log(

`💾 Memory saved: ${key}`

);



return true;


}









// ============================================
// GET MEMORY
// ============================================


function getMemory(

userId

){

userId = normalizeUserId(userId);



const data =

loadMemory();





if(

!data.users[userId]

){


return {};

}





return (

data.users[userId]

.memories || {}

);



}









// ============================================
// SEARCH MEMORY
// ============================================


function searchMemory(

userId,

keyword

){

userId = normalizeUserId(userId);



const memories =

getMemory(userId);





const results=[];



keyword =

keyword.toLowerCase();






for(

const key in memories

){



const item =

memories[key];





if(

key.toLowerCase()

.includes(keyword)

||

String(item.value)

.toLowerCase()

.includes(keyword)

){



results.push({

key,

...item

});



}



}





return results;


}









// ============================================
// DELETE MEMORY
// ============================================


function deleteMemory(

userId,

key

){

userId = normalizeUserId(userId);



const data =

loadMemory();





if(

data.users[userId]

&&

data.users[userId]

.memories[key]

){



delete data.users[userId]

.memories[key];





saveFile(data);



return true;


}





return false;


}









// ============================================
// CLEAR USER MEMORY
// ============================================


function clearMemory(

userId

){

userId = normalizeUserId(userId);



const data =

loadMemory();





if(data.users[userId]){


delete data.users[userId];


saveFile(data);



return true;


}



return false;


}









module.exports={


saveMemory,


getMemory,


searchMemory,


deleteMemory,


clearMemory


};

