/*
============================================
 Prime IMAGE PROMPT ENHANCER v1.0
============================================

Turns simple prompts into powerful image prompts.

Example:

Input:
"make a dragon"

Output:
"Create a highly detailed fantasy dragon,
realistic scales, cinematic lighting,
4K quality..."

============================================
*/


function detectSubject(prompt){

    const text =
    prompt.toLowerCase();


    if(text.includes("car"))
        return "vehicle";


    if(text.includes("robot"))
        return "robot";


    if(text.includes("dragon"))
        return "fantasy creature";


    if(text.includes("person") ||
       text.includes("human"))
        return "character";


    if(text.includes("house") ||
       text.includes("building"))
        return "architecture";


    if(text.includes("space") ||
       text.includes("planet"))
        return "space scene";


    return "creative scene";

}





function detectStyle(prompt){

    const text =
    prompt.toLowerCase();


    if(text.includes("anime"))
        return "anime art style";


    if(text.includes("cartoon"))
        return "cartoon style";


    if(text.includes("3d"))
        return "3D render style";


    if(text.includes("realistic"))
        return "photorealistic style";


    if(text.includes("cyberpunk"))
        return "cyberpunk futuristic style";


    return "cinematic realistic style";

}





function enhancePrompt(prompt){


    const subject =
    detectSubject(prompt);


    const style =
    detectStyle(prompt);



    const enhanced = `

Create a ${subject}.

Original concept:
${prompt}


Style:
${style}


Quality:
Ultra detailed,
high resolution,
professional artwork,
realistic textures,
cinematic lighting,
depth of field,
8K quality.


Make the image visually stunning.

`;



    return enhanced.trim();

}





module.exports = {

    enhancePrompt,

    detectSubject,

    detectStyle

};