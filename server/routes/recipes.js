const express = require('express');
const axios = require('axios');
const router = express.Router();
const Recipe = require('../models/Recipe');

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

// @route   GET /api/recipes/findByIngredients
// @desc    Get recipes based on a comma separated list of ingredients
router.get('/findByIngredients', async (req, res) => {
    try {
        const { ingredients, diet, number = 10 } = req.query;
        console.log(`Incoming request for ingredients: ${ingredients}, diet: ${diet}`);

        if (!ingredients && !diet) {
            return res.status(400).json({ msg: 'Please provide ingredients or diet' });
        }

        console.log('Fetching from Spoonacular...');

        let response;
        if (diet) {
            // Use complexSearch for dietary filters
            response = await axios.get(`${BASE_URL}/complexSearch`, {
                params: {
                    includeIngredients: ingredients,
                    diet: diet,
                    number,
                    apiKey: SPOONACULAR_API_KEY,
                    fillIngredients: true,
                    addRecipeInformation: true,
                    sort: 'max-used-ingredients'
                }
            });
            // Map complexSearch results to match findByIngredients structure
            res.json(response.data.results);
        } else {
            // Use simple findByIngredients
            response = await axios.get(`${BASE_URL}/findByIngredients`, {
                params: {
                    ingredients,
                    number,
                    apiKey: SPOONACULAR_API_KEY,
                    ranking: 2
                }
            });
            res.json(response.data);
        }
    } catch (err) {
        console.error('Error fetching recipes:', err.response ? err.response.data : err.message);
        const statusCode = err.response?.status || 500;
        res.status(statusCode).json({
            msg: statusCode === 402 ? 'Spoonacular API Daily Limit Reached' : 'Server Error while calling Spoonacular API',
            details: err.response ? err.response.data : err.message
        });
    }
});

// @route   GET /api/recipes/:id/information
// @desc    Get detailed recipe information (instructions, nutrition)
router.get('/:id/information', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`${BASE_URL}/${id}/information`, {
            params: {
                apiKey: SPOONACULAR_API_KEY,
                includeNutrition: true
            }
        });
        res.json(response.data);
    } catch (err) {
        console.error('Error fetching recipe info:', err.response ? err.response.data : err.message);
        const statusCode = err.response?.status || 500;
        res.status(statusCode).json({ msg: 'Error fetching recipe details', details: err.response?.data });
    }
});

// @route   POST /api/recipes/favorite
// @desc    Save a recipe to favorites collection
router.post('/favorite', async (req, res) => {
    try {
        const { spoonacularId, title, image, missedIngredientCount, missedIngredients, usedIngredients } = req.body;

        // Check if recipe is already favorited
        const existingRecipe = await Recipe.findOne({ spoonacularId });
        if (existingRecipe) {
            return res.json(existingRecipe); // Gracefully return existing
        }

        const newFavorite = new Recipe({
            spoonacularId,
            title,
            image,
            missedIngredientCount,
            missedIngredients,
            usedIngredients
        });

        const savedRecipe = await newFavorite.save();
        res.json(savedRecipe);
    } catch (err) {
        console.error('Error saving favorite:', err.message);
        res.status(500).send('Server Error while saving favorite recipe');
    }
});

// @route   GET /api/recipes/favorites
// @desc    Get all favorite recipes
router.get('/favorites', async (req, res) => {
    try {
        const favorites = await Recipe.find().sort({ createdAt: -1 });
        res.json(favorites);
    } catch (err) {
        console.error('Error fetching favorites:', err.message);
        res.status(500).send('Server Error while fetching favorite recipes');
    }
});

// @route   DELETE /api/recipes/favorite/:spoonacularId
// @desc    Remove a recipe from favorites
router.delete('/favorite/:spoonacularId', async (req, res) => {
    try {
        const { spoonacularId } = req.params;
        const result = await Recipe.findOneAndDelete({ spoonacularId });

        if (!result) {
            return res.status(404).json({ msg: 'Recipe not found in favorites' });
        }

        res.json({ msg: 'Recipe removed from favorites' });
    } catch (err) {
        console.error('Error removing favorite:', err.message);
        res.status(500).send('Server Error while removing favorite recipe');
    }
});

module.exports = router;
