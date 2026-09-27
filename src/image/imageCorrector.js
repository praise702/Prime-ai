/*
============================================
 Prime IMAGE CORRECTOR v1.0
============================================

Checks and corrects image-generation requests
before they are sent to the image engine.

============================================
*/


function cleanText(text) {

    if (typeof text !== "string") {
        return "";
    }

    return text
        .replace(/\s+/g, " ")
        .trim();

}



function correctPrompt(prompt) {

    let corrected = cleanText(prompt);


    if (!corrected) {

        return {
            valid: false,
            correctedPrompt: "",
            corrections: [
                "Image prompt is empty."
            ]
        };

    }



    const corrections = [];



    // Remove unnecessary repeated spaces
    if (prompt !== corrected) {

        corrections.push(
            "Removed unnecessary spaces."
        );

    }



    // Fix common image-prompt wording
    const replacements = [

        {
            pattern: /\bhigh quality\b/gi,
            replacement: "high-quality"
        },

        {
            pattern: /\bultra realistic\b/gi,
            replacement: "ultra-realistic"
        },

        {
            pattern: /\bphoto realistic\b/gi,
            replacement: "photorealistic"
        }

    ];



    for (const item of replacements) {

        if (item.pattern.test(corrected)) {

            corrected =
                corrected.replace(
                    item.pattern,
                    item.replacement
                );

            corrections.push(
                `Corrected wording to "${item.replacement}".`
            );

        }

    }



    return {

        valid: true,

        correctedPrompt:
            corrected,

        corrections

    };

}





function validateImageRequest(request) {

    const errors = [];



    if (!request) {

        errors.push(
            "Image request is missing."
        );

        return errors;

    }



    if (!request.originalPrompt) {

        errors.push(
            "Original image prompt is missing."
        );

    }



    if (!request.style) {

        errors.push(
            "Image style is missing."
        );

    }



    if (!request.aspectRatio) {

        errors.push(
            "Image aspect ratio is missing."
        );

    }



    return errors;

}





function correctImageRequest(request) {

    const errors =
        validateImageRequest(request);



    if (errors.length > 0) {

        return {

            valid: false,

            request,

            errors,

            corrections: []

        };

    }



    const promptResult =
        correctPrompt(
            request.originalPrompt
        );



    if (!promptResult.valid) {

        return {

            valid: false,

            request,

            errors:
                promptResult.corrections,

            corrections: []

        };

    }



    const correctedRequest = {

        ...request,

        originalPrompt:
            promptResult.correctedPrompt

    };



    return {

        valid: true,

        request:
            correctedRequest,

        corrections:
            promptResult.corrections,

        errors: []

    };

}





module.exports = {

    correctPrompt,

    validateImageRequest,

    correctImageRequest

};