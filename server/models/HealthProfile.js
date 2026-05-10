const mongoose = require('mongoose');

// We use a singleton pattern where there is only one global profile in the array/collection
const HealthProfileSchema = new mongoose.Schema({
    weight: { type: Number, default: 0 }, // kg
    height: { type: Number, default: 0 }, // cm
    conditions: { type: [String], default: [] }, // e.g., 'Diabetes', 'Peanut Allergy'
    goals: { type: String, default: 'Maintain general health' }
}, { timestamps: true });

module.exports = mongoose.model('HealthProfile', HealthProfileSchema);
