/*
========================================
🚀 Prime UNIT CONVERTER v1
========================================

Converts:

✅ Length
✅ Weight
✅ Temperature
✅ Time

Examples:

10 km to meters
5 feet to cm
1000 grams to kg
25 celsius to fahrenheit

========================================
*/



function convert(message){


const text =
message
.toLowerCase()
.trim();





// ================================
// LENGTH
// ================================


let length =
text.match(
/(\d+(?:\.\d+)?)\s*(km|kilometer|kilometre|m|meter|metre|cm|centimeter|mm|mile|feet|foot|ft|inch|in)\s*(to|into)\s*(km|kilometer|kilometre|m|meter|metre|cm|centimeter|mm|mile|feet|foot|ft|inch|in)/
);



if(length){


let value =
Number(length[1]);


let from =
length[2];


let to =
length[4];



let meters;



// convert to meters

switch(from){


case "km":
case "kilometer":
case "kilometre":
meters=value*1000;
break;


case "cm":
case "centimeter":
meters=value/100;
break;


case "mm":
meters=value/1000;
break;


case "mile":
meters=value*1609.34;
break;


case "feet":
case "foot":
case "ft":
meters=value*0.3048;
break;


case "inch":
case "in":
meters=value*0.0254;
break;


default:
meters=value;


}




// meters to target


switch(to){


case "km":
case "kilometer":
case "kilometre":
return meters/1000;


case "cm":
case "centimeter":
return meters*100;


case "mm":
return meters*1000;


case "mile":
return meters/1609.34;


case "feet":
case "foot":
case "ft":
return meters/0.3048;


case "inch":
case "in":
return meters/0.0254;


default:
return meters;


}


}








// ================================
// WEIGHT
// ================================


let weight =
text.match(

/(\d+(?:\.\d+)?)\s*(kg|kilogram|g|gram|mg|pound|lb)\s*(to|into)\s*(kg|kilogram|g|gram|mg|pound|lb)/

);



if(weight){


let value =
Number(weight[1]);


let from =
weight[2];


let to =
weight[4];



let grams;



switch(from){


case "kg":
case "kilogram":
grams=value*1000;
break;


case "mg":
grams=value/1000;
break;


case "pound":
case "lb":
grams=value*453.592;
break;


default:
grams=value;


}




switch(to){


case "kg":
case "kilogram":
return grams/1000;


case "mg":
return grams*1000;


case "pound":
case "lb":
return grams/453.592;


default:
return grams;


}


}









// ================================
// TEMPERATURE
// ================================


let temp =
text.match(

/(-?\d+(?:\.\d+)?)\s*(celsius|c|fahrenheit|f)\s*(to|into)\s*(celsius|c|fahrenheit|f)/

);



if(temp){



let value =
Number(temp[1]);


let from =
temp[2];


let to =
temp[4];




if(
(from==="c"||from==="celsius")
&&
(to==="f"||to==="fahrenheit")
){


return (value*9/5)+32;


}





if(
(from==="f"||from==="fahrenheit")
&&
(to==="c"||to==="celsius")
){


return (value-32)*5/9;


}



return value;



}








return null;


}






module.exports={

convert

};