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

// @route   POST /api/vision/chef
// @desc    Generate a custom recipe based on ingredients
router.post('/chef', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ msg: 'Gemini API key is not configured.' });
        }

        const { ingredients } = req.body;
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ msg: 'Please provide an array of ingredients.' });
        }

        const prompt = `You are a creative, expert chef. Create a delicious, easy-to-follow recipe using primarily these ingredients: ${ingredients.join(', ')}. You can assume the user has basic pantry staples like salt, pepper, oil, and water.
        
        Format the response in JSON exactly following this structure:
        {
          "title": "Creative Recipe Name",
          "readyInMinutes": 30,
          "servings": 2,
          "ingredients": ["1 cup ingredient1", "2 tbsp ingredient2"],
          "instructions": [
             "Step 1...",
             "Step 2..."
          ]
        }`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [prompt],
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        const recipeData = JSON.parse(text);

        res.json(recipeData);

    } catch (err) {
        console.error('Error generating AI recipe:', err);
        res.status(500).json({ msg: 'Server Error during recipe generation', details: err.message });
    }
});

module.exports = router;
