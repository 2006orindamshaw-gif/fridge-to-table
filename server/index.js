require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const recipeRoutes = require('./routes/recipes');
const pantryRoutes = require('./routes/pantry');
const shoppingListRoutes = require('./routes/shoppingList');
const visionRoutes = require('./routes/vision');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const mongooseOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

let lastDbError = null;
mongoose.connect(process.env.MONGO_URI, mongooseOptions)
    .then(() => {
        console.log('MongoDB connected successfully');
        lastDbError = null;
    })
    .catch(err => {
        lastDbError = err.message;
        console.error('MongoDB connection error details:', err.message);
    });

app.get('/api/status', (req, res) => {
    const status = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ status, error: lastDbError });
});

// Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/vision', visionRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
