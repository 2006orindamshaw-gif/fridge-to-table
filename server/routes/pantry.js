const express = require('express');
const router = express.Router();
const Pantry = require('../models/Pantry');

// @route   GET /api/pantry
// @desc    Get all pantry staples
router.get('/', async (req, res) => {
    try {
        const items = await Pantry.find().sort({ name: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/pantry
// @desc    Add a staple to pantry
router.post('/', async (req, res) => {
    try {
        const { name, aisle, image } = req.body;
        let item = await Pantry.findOne({ name });
        if (item) return res.json(item);

        item = new Pantry({ name, aisle, image });
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/pantry/:id
router.delete('/:id', async (req, res) => {
    try {
        await Pantry.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Item removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/pantry
// @desc    Clear all items
router.delete('/', async (req, res) => {
    try {
        await Pantry.deleteMany({});
        res.json({ msg: 'All items removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
