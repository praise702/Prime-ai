/*
================================================
🧠 Prime RESPONSE FORMATTER v1
================================================

Features:

✅ AI style answers
✅ Removes garbage text
✅ Creates sections
✅ Bullet points
✅ Source formatting
✅ Summary generation
✅ Confidence scoring
✅ Duplicate removal
✅ Long text compression
================================================
*/


// =============================================
// CLEAN TEXT
// =============================================


function cleanText(text){

if(!text)
return "";


return String(text)

.replace(/<[^>]*>/g," ")

.replace(/\[\d+\]/g,"")

.replace(/\s+/g," ")

.trim();

}



// =============================================
// SENTENCE SPLITTER
// =============================================


function splitSentences(text){

return text

.split(/[.!?]/)

.map(x=>x.trim())

.filter(x=>x.length>20);

}



// =============================================
// SUMMARY ENGINE
// =============================================


function summarize(text,limit=5){


const sentences =
splitSentences(text);



return sentences

.slice(0,limit)

.map(x=>"• "+x)

.join("\n");


}




// =============================================
// REMOVE DUPLICATES
// =============================================


function removeDuplicates(lines){


const used=new Set();


return lines.filter(line=>{


const key=line

.toLowerCase()

.substring(0,80);



if(used.has(key))
return false;



used.add(key);

return true;


});


}



// =============================================
// SOURCE FORMATTER
// =============================================


function formatSources(results){


if(!results || results.length===0)

return "No sources available";



return results

.slice(0,5)

.map((r,i)=>{

return (

`${i+1}. ${r.title || "Unknown"}\n`+
`   ${r.url || ""}`

);

})

.join("\n\n");


}





// =============================================
// CONFIDENCE SCORE
// =============================================


function confidence(results){


if(!results)

return 0;



if(results.length>=5)

return "High";



if(results.length>=2)

return "Medium";


return "Low";


}





// =============================================
// MAIN FORMATTER
// =============================================


function formatResponse(data){



let answer = cleanText(

data.answer ||

data.text ||

""

);



let results =
data.sources || [];




// Create bullets


let points =
summarize(answer);



// Remove duplicates


points =

removeDuplicates(

points.split("\n")

)

.join("\n");





let output = `

## ${data.title || "Prime Response"}


${points}



`;



// Add details


if(answer.length>300){


output += `

### Detailed Explanation

${answer}

`;

}



// Sources


output += `

---

### 📚 Sources

${formatSources(results)}


### 🧠 Confidence

${confidence(results)}

`;





return output.trim();


}





module.exports={

formatResponse

};