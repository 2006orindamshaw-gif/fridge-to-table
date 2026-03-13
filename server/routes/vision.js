const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');

// Setting up multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @route   POST /api/vision/scan
// @desc    Scan an image using Gemini to detect ingredients
router.post('/scan', upload.single('image'), async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ msg: 'Gemini API key is not configured on the server.' });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'No image uploaded.' });
        }

        const prompt = "Identify the raw ingredients in this fridge/pantry image. Return only a comma-separated list of ingredient names. Do not include quantities or descriptive adjectives (e.g., return 'apple, chicken, milk' instead of '3 red apples, raw chicken breast, half gallon of milk'). If no ingredients are found, return 'None'.";

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype,
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                imagePart,
                prompt
            ]
        });

        const text = response.text;

        if (text.trim().toLowerCase() === 'none' || !text) {
            return res.json({ ingredients: [] });
        }

        // Split by comma and clean up spaces
        const ingredients = text.split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        res.json({ ingredients });

    } catch (err) {
        console.error('Error scanning image:', err);
        res.status(500).json({ msg: 'Server Error during image analysis', details: err.message });
    }
});

module.exports = router;
