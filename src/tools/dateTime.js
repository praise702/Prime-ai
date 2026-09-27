/*
========================================
🚀 Prime DATE TIME TOOL v1
========================================

Handles:

✅ Current date
✅ Current time
✅ Day
✅ Basic timezone support

========================================
*/


function getTime(message){


const text =
message
.toLowerCase()
.trim();




const now =
new Date();





// ================================
// CURRENT TIME
// ================================


if(

text.includes("time") ||
text.includes("clock")

){


return {


type:"time",


answer:

now.toLocaleTimeString(
"en-US",
{
hour:"2-digit",
minute:"2-digit",
second:"2-digit"
}
)


};



}








// ================================
// CURRENT DATE
// ================================


if(

text.includes("date") ||
text.includes("today") ||
text.includes("day")

){



return {


type:"date",


answer:

now.toLocaleDateString(
"en-US",
{
weekday:"long",
year:"numeric",
month:"long",
day:"numeric"
}
)


};



}







// ================================
// YEAR
// ================================


if(
text.includes("year")
){


return {


type:"year",

answer:
String(now.getFullYear())


};


}







return null;


}







module.exports={

getTime

};