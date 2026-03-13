const express = require('express');
const router = express.Router();
const ShoppingList = require('../models/ShoppingList');

// @route   GET /api/shopping-list
router.get('/', async (req, res) => {
    try {
        const items = await ShoppingList.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/shopping-list
router.post('/', async (req, res) => {
    try {
        const { name, aisle, image, amount, unit } = req.body;
        const newItem = new ShoppingList({ name, aisle, image, amount, unit });
        await newItem.save();
        res.json(newItem);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/shopping-list/:id
router.delete('/:id', async (req, res) => {
    try {
        await ShoppingList.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Item removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PATCH /api/shopping-list/:id
// @desc    Toggle completion
router.patch('/:id', async (req, res) => {
    try {
        const item = await ShoppingList.findById(req.params.id);
        item.completed = !item.completed;
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/shopping-list
// @desc    Clear all items
router.delete('/', async (req, res) => {
    try {
        await ShoppingList.deleteMany({});
        res.json({ msg: 'All items removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
