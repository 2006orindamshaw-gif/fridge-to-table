const mongoose = require('mongoose');

const PantrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    aisle: String,
    image: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pantry', PantrySchema);
