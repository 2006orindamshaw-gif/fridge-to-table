const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    spoonacularId: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    missedIngredientCount: {
        type: Number,
        default: 0
    },
    missedIngredients: [{
        name: String,
        amount: Number,
        unit: String
    }],
    usedIngredients: [{
        name: String,
        amount: Number,
        unit: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Recipe', RecipeSchema);
