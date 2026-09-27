/*
============================================
 Prime CREATIVE VISION ENGINE v2.0
============================================

Advanced image prompt intelligence

============================================
*/


function detectMood(prompt){

    const text = prompt.toLowerCase();


    if(text.includes("dark") ||
       text.includes("horror") ||
       text.includes("scary"))
    {
        return "dark cinematic mysterious atmosphere";
    }


    if(text.includes("happy") ||
       text.includes("cute"))
    {
        return "bright cheerful magical atmosphere";
    }


    if(text.includes("luxury"))
    {
        return "premium elegant luxury atmosphere";
    }


    if(text.includes("future") ||
       text.includes("futuristic"))
    {
        return "advanced futuristic atmosphere";
    }


    return "cinematic immersive atmosphere";

}







function detectStyle(prompt){

    const text = prompt.toLowerCase();


    if(text.includes("anime"))
        return "high quality anime art style";


    if(text.includes("3d"))
        return "professional 3D rendered style";


    if(text.includes("realistic"))
        return "ultra realistic photography style";


    if(text.includes("painting"))
        return "beautiful digital painting style";


    return "cinematic realistic fantasy style";

}








function detectEnvironment(prompt){

    const text = prompt.toLowerCase();


    if(text.includes("dragon"))
        return "ancient fantasy mountains, magical forests, mysterious landscape";


    if(text.includes("car"))
        return "futuristic city highway with advanced architecture";


    if(text.includes("house") ||
       text.includes("home"))
        return "beautiful natural environment with detailed surroundings";


    if(text.includes("robot"))
        return "advanced AI laboratory with futuristic technology";


    if(text.includes("space") ||
       text.includes("planet"))
        return "deep space environment with galaxies and cosmic clouds";


    return "creative detailed environment";

}








function createLighting(prompt){

    const text = prompt.toLowerCase();


    if(text.includes("night"))
        return "moonlight with dramatic shadows";


    if(text.includes("sunset"))
        return "golden sunset cinematic lighting";


    if(text.includes("dark"))
        return "dramatic low key lighting";


    return "professional cinematic lighting";

}








function createCamera(){

    const cameras=[

        "35mm cinematic lens",
        "wide angle photography",
        "close up detailed shot",
        "drone aerial perspective",
        "professional studio camera"

    ];


    return cameras[
        Math.floor(Math.random()*cameras.length)
    ];

}








function createComposition(){

    const compositions=[

        "epic cinematic composition",
        "balanced professional composition",
        "dynamic action composition",
        "dramatic perspective",
        "beautiful depth of field"

    ];


    return compositions[
        Math.floor(Math.random()*compositions.length)
    ];

}








function qualityEnhancement(){

    return [

        "realistic textures",
        "high detail",
        "professional lighting",
        "sharp focus",
        "beautiful colors",
        "ultra realistic",
        "8K resolution"

    ].join(", ");

}








function createVision(prompt){


    return `

Create a masterpiece image based on:

${prompt}


Prime Creative Vision:


Subject:
${prompt}


Style:
${detectStyle(prompt)}


Environment:
${detectEnvironment(prompt)}


Mood:
${detectMood(prompt)}


Lighting:
${createLighting(prompt)}


Camera:
${createCamera()}


Composition:
${createComposition()}


Visual Quality:

${qualityEnhancement()}


Make the image unique,
creative,
professional,
and visually stunning.

`;

}








module.exports={

    createVision,
    detectMood,
    detectStyle,
    detectEnvironment,
    createLighting

};