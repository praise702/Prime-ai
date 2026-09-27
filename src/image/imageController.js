/*
============================================
 Prime IMAGE CONTROLLER v3.1
============================================

Features:

✅ Receive image prompts
✅ Creative Vision enhancement
✅ Image prompt correction
✅ Image processing pipeline
✅ Save image history
✅ Future AI model ready

============================================
*/


const creativeVision =
require("./creativeVision");


const imageHistory =
require("./imageHistory");


const imageManager =
require("./imageManager");


const imageCorrector =
require("./imageCorrector");


function describeImageFailure(imageResult){

    const failures = Array.isArray(imageResult?.failures) ? imageResult.failures : [];
    const retryable = failures.find(item => item && /timeout|network|connect|5\d\d/i.test(String(item.error || "")));

    if (retryable) {
        return "Prime could not finish the image right now. Please try again.";
    }

    return "Prime could not create the image right now. Please try again.";
}


// ============================================
// CREATE IMAGE
// ============================================


async function createImage(req,res){


    try{


        const {
            prompt
        } = req.body;

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Authentication is required." });
        }



        // ====================================
        // CHECK PROMPT
        // ====================================


        if(!prompt || prompt.trim()==="")
        {

            return res.status(400).json({

                success:false,

                error:
                "Image prompt required"

            });

        }



        console.log("[IMAGE] request accepted", { userId, promptLength: prompt.length });



        // ====================================
        // CREATIVE VISION ENGINE
        // ====================================


        const enhancedPrompt =
        creativeVision.createVision(
            prompt
        );


        console.log("[IMAGE] vision prompt prepared", { requestId: "pending", length: enhancedPrompt.length });



        // ====================================
        // IMAGE PROMPT CORRECTOR
        // ====================================


        const correctionResult =
        imageCorrector.correctPrompt(
            enhancedPrompt
        );


        if(!correctionResult.valid)
        {

            return res.status(400).json({

                success:false,

                error:
                "Image prompt correction failed",

                details:
                correctionResult.corrections

            });

        }



        const correctedPrompt =
        correctionResult.correctedPrompt;



        console.log("[IMAGE] corrected prompt prepared", { length: correctedPrompt.length });



        // ====================================
        // IMAGE GENERATION ENGINE
        // ====================================


        console.log(
            "\n🎨 IMAGE ENGINE STARTED"
        );


        const imageResult =
        await imageManager.createImage(
            correctedPrompt,
            {
                userId,
                originalPrompt: prompt,
                enhancedPrompt
            }
        );



        // ====================================
        // RESPONSE
        // ====================================


        if (!imageResult.success || !imageResult.imageUrl) {

            return res.status(502).json({

                success:false,

                type:"image",

                imageUrl:null,

                image: {
                    status: imageResult.status || "failed",
                    requestId: imageResult.requestId || null,
                    imageUrl: null
                },

                error:describeImageFailure(imageResult)

            });

        }


        imageHistory.saveImage(
            userId,
            prompt,
            correctedPrompt,
            { imageUrl: imageResult.imageUrl, requestId: imageResult.requestId }
        );


        return res.json({

            success:true,

            type:
            "image",

            originalPrompt:
            prompt,

            enhancedPrompt:
            enhancedPrompt,

            correctedPrompt:
            correctedPrompt,

            corrections:
            correctionResult.corrections,

            image: {
                status: imageResult.status,
                requestId: imageResult.requestId,
                imageUrl: imageResult.imageUrl
            }

        });


    }

    catch(error){


        console.error("❌ IMAGE CONTROLLER ERROR:", {
            name: error?.name || "Error",
            message: error?.message || "Unknown error",
            code: error?.code || null,
            status: error?.response?.status || null
        });


        return res.status(500).json({

            success:false,

            error:
            "Prime Image Internal Error"

        });


    }

}



// ============================================
// GET IMAGE HISTORY
// ============================================


function getImageHistory(req,res){


    try{


        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Authentication is required." });
        }


        const images =
        imageHistory.getImages(userId);


        return res.json({

            success:true,

            images

        });


    }

    catch(error){


        return res.status(500).json({

            success:false,

            error:
            "Could not load image history"

        });


    }

}



// ============================================
// DELETE IMAGE
// ============================================


function deleteImage(req,res){


    try{


        const id = req.body?.id;
        if (typeof id !== "string" || !/^img_[A-Fa-f0-9]{36}$/.test(id)) {
            return res.status(400).json({ success: false, error: "Invalid image id." });
        }
        const deleted = imageHistory.deleteImage(req.user.id, id);
        if (!deleted) return res.status(404).json({ success: false, error: "Image not found." });
        return res.json({ success: true, message: "Image deleted" });


    }

    catch(error){


        return res.status(500).json({

            success:false,

            error:
            "Delete failed"

        });


    }

}



// ============================================
// EXPORTS
// ============================================


module.exports = {

    createImage,

    getImageHistory,

    deleteImage

};
