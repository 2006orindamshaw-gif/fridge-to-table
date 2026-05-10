const express = require('express');
const router = express.Router();
const HealthProfile = require('../models/HealthProfile');

// @route   GET /api/profile
// @desc    Get the global health profile
router.get('/', async (req, res) => {
    try {
        let profile = await HealthProfile.findOne();
        if (!profile) {
            profile = new HealthProfile();
            await profile.save();
        }
        res.json(profile);
    } catch (err) {
        console.error('Error fetching profile:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/profile
// @desc    Update the global health profile
router.post('/', async (req, res) => {
    try {
        const { weight, height, conditions, goals } = req.body;
        let profile = await HealthProfile.findOne();
        
        if (!profile) {
            profile = new HealthProfile({ weight, height, conditions, goals });
        } else {
            profile.weight = weight;
            profile.height = height;
            profile.conditions = conditions;
            profile.goals = goals;
        }

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error('Error saving profile:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
