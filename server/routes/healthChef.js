const express = require('express');
const router = express.Router();
const HealthProfile = require('../models/HealthProfile');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ msg: 'Gemini API key is not configured.' });
        }

        const { ingredients } = req.body;
        let profile = await HealthProfile.findOne();

        // Calculate time of day for the local server
        const hour = new Date().getHours();
        let mealType = "Dinner";
        if (hour >= 5 && hour < 11) mealType = "Breakfast";
        else if (hour >= 11 && hour < 16) mealType = "Lunch";

        let conditionsText = "None";
        let goalsText = "General healthy eating";
        let statsText = "Standard healthy adult";

        if (profile) {
            if (profile.conditions && profile.conditions.length > 0) {
                conditionsText = profile.conditions.join(', ');
            }
            if (profile.goals) goalsText = profile.goals;
            if (profile.weight > 0 && profile.height > 0) {
                statsText = `Weight: ${profile.weight}kg, Height: ${profile.height}cm`;
            }
        }

        const prompt = `You are a strict, expert clinical Dietitian and world-class Chef. 
Your client wants to eat a very healthy ${mealType}. 
Here is their profile:
- Stats: ${statsText}
- Medical Conditions & Allergies: ${conditionsText}
- Core Health Goal: ${goalsText}

They have these ingredients available: ${ingredients && ingredients.length > 0 ? ingredients.join(', ') : 'Nothing specific, assume basic staples like oil, salt, pepper.'}.

Create a perfectly tailored ${mealType} recipe for 1 serving. It MUST strictly avoid aggravating any of their medical conditions, and it MUST actively support their health goals. Focus heavily on creating a nutritional powerhouse based precisely on their profile.

Format the response EXACTLY as this JSON structure:
{
  "title": "Healthy Recipe Name",
  "reasoning": "A short, motivating paragraph explaining to the user exactly WHY this meal is perfectly designed for their specific health goals and medical conditions. Sound like an encouraging doctor/dietitian.",
  "macros": {
    "calories": 450,
    "protein": "30g",
    "carbs": "40g",
    "fats": "15g"
  },
  "readyInMinutes": 20,
  "ingredients": ["exact ingredient 1", "exact ingredient 2"],
  "instructions": [
    "Step 1...",
    "Step 2..."
  ]
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [prompt],
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        const recipeData = JSON.parse(text);
        
        // Also send back what meal type was detected so the UI knows
        recipeData.mealType = mealType;

        res.json(recipeData);

    } catch (err) {
        console.error('Error generating Health Chef recipe:', err);
        res.status(500).json({ msg: 'Server Error during health recipe generation', details: err.message });
    }
});

module.exports = router;
