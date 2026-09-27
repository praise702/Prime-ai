/*
============================================
 Prime STYLE DETECTOR v1.0
============================================

Understands the visual style requested
by the user.

Examples:

"anime warrior"
→ anime illustration

"luxury house"
→ architectural visualization

"dragon"
→ fantasy cinematic art

============================================
*/



function detectStyle(prompt){


    const text =
    prompt.toLowerCase();




    // Anime

    if(
        text.includes("anime") ||
        text.includes("manga") ||
        text.includes("japanese")
    ){

        return {

            style:
            "anime cinematic illustration",

            details:
            [
                "detailed character design",
                "vibrant colors",
                "dynamic pose",
                "high quality anime art"
            ]

        };

    }







    // Realistic

    if(
        text.includes("realistic") ||
        text.includes("photo") ||
        text.includes("photography")
    ){

        return {

            style:
            "ultra realistic photography",

            details:
            [
                "natural lighting",
                "real world textures",
                "professional camera quality",
                "high resolution"
            ]

        };

    }







    // 3D

    if(
        text.includes("3d") ||
        text.includes("render") ||
        text.includes("blender")
    ){

        return {

            style:
            "3D realistic render",

            details:
            [
                "realistic materials",
                "global illumination",
                "cinematic rendering",
                "high detail models"
            ]

        };

    }







    // Architecture

    if(
        text.includes("house") ||
        text.includes("room") ||
        text.includes("building") ||
        text.includes("interior")
    ){

        return {

            style:
            "architectural visualization",

            details:
            [
                "professional interior design",
                "realistic lighting",
                "modern materials",
                "design magazine quality"
            ]

        };

    }








    // Fantasy

    if(
        text.includes("dragon") ||
        text.includes("magic") ||
        text.includes("fantasy")
    ){

        return {

            style:
            "fantasy cinematic artwork",

            details:
            [
                "epic atmosphere",
                "dramatic lighting",
                "fantasy environment",
                "movie quality"
            ]

        };

    }








    // Default

    return {

        style:
        "cinematic digital artwork",

        details:
        [
            "creative composition",
            "professional lighting",
            "high detail",
            "beautiful visuals"
        ]

    };


}






module.exports = {

    detectStyle

};