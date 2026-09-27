const express = require("express");
const normalizedSearch = require("../knowledge/normalizedSearch");
const router = express.Router();

function number(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

router.get("/", async (req, res) => {
    const query = String(req.query.q || req.query.query || "").trim();
    if (!query || query.length > 500) {
        return res.status(400).json({ success: false, error: "A search query between 1 and 500 characters is required." });
    }

    const latitude = number(req.query.lat);
    const longitude = number(req.query.lon);
    const location = Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
        ? { latitude, longitude }
        : undefined;

    try {
        const results = await normalizedSearch.search(query, { location });
        return res.json({
            success: true,
            query,
            results: results.slice(0, 20),
            providers: normalizedSearch.providerStatus()
        });
    } catch (error) {
        return res.status(502).json({ success: false, error: "Web search is temporarily unavailable." });
    }
});

module.exports = router;
