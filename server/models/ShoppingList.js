const mongoose = require('mongoose');

const ShoppingListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    aisle: String,
    image: String,
    amount: Number,
    unit: String,
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ShoppingList', ShoppingListSchema);
