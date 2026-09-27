/*
============================================
 Prime IMAGE BRAIN v4.0
============================================

Smart image understanding system

============================================
*/



function detectStyle(prompt){


    const text =
    prompt.toLowerCase();



    if(text.includes("anime"))
        return "anime digital art";


    if(text.includes("realistic"))
        return "photorealistic";


    if(text.includes("cartoon"))
        return "cartoon illustration";


    if(text.includes("3d"))
        return "3D rendered artwork";


    if(text.includes("painting"))
        return "oil painting style";


    if(text.includes("cyberpunk"))
        return "cyberpunk futuristic style";


    return "cinematic realistic style";

}







function detectRatio(prompt){


    const text =
    prompt.toLowerCase();



    if(text.includes("phone") ||
       text.includes("mobile"))
    {

        return "9:16";

    }



    if(text.includes("wide") ||
       text.includes("landscape"))
    {

        return "16:9";

    }



    return "1:1";


}







function createNegativePrompt(){


    return [

        "blurry",

        "low quality",

        "bad anatomy",

        "distorted",

        "duplicate objects",

        "poor lighting"

    ].join(", ");

}







function analyzeImageRequest(prompt){



    return {


        originalPrompt:
        prompt,


        style:
        detectStyle(prompt),



        aspectRatio:
        detectRatio(prompt),



        negativePrompt:
        createNegativePrompt(),



        quality:
        "ultra high detail"



    };

}








module.exports={


    analyzeImageRequest,

    detectStyle,

    detectRatio

};