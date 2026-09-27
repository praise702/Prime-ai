/*
========================================
🚀 Prime TOOL MANAGER v2
========================================

Controls all Prime tools.

Current tools:
✅ Calculator
✅ File Reader
✅ Unit Converter
✅ Date Time
✅ Translator (ready)
✅ Search (ready)

========================================
*/


const calculator =
require("./calculator");


const fileReader =
require("./fileReader");




// Future tools
let unitConverter;
let dateTime;
let translator;
let searchTool;



try {

    unitConverter =
    require("./unitConverter");

}
catch{

    unitConverter = null;

}



try {

    dateTime =
    require("./dateTime");

}
catch{

    dateTime = null;

}



try {

    translator =
    require("./translator");

}
catch{

    translator = null;

}



try {

    searchTool =
    require("./searchTool");

}
catch{

    searchTool = null;

}








function runTool(
tool,
input
){


try{



switch(tool){



case "calculator":

return calculator.calculate(input);





case "fileReader":

return fileReader.readFile(input);







case "unitConverter":


if(unitConverter){

return unitConverter.convert(input);

}

break;







case "dateTime":


if(dateTime){

return dateTime.getTime(input);

}

break;







case "translator":


if(translator){

return translator.translate(input);

}

break;







case "search":


if(searchTool){

return searchTool.search(input);

}

break;






default:

return null;



}





return null;



}
catch(error){


console.log(
"Tool Error:",
error
);


return null;


}


}







module.exports={

runTool

};