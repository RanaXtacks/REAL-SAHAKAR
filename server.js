const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not defined in .env file');
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('MongoDB Connected Successfully!'))
        .catch(err => console.error('Database connection error:', err.message));
}

// Root route
app.get('/', (req, res) => {
    res.json({
        name: 'SahakarConnect API',
        version: '1.0.0',
        status: 'online',
        message: 'Welcome to SahakarConnect Backend'
    });
});

// Standard Health check route
app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
            status: dbStatusMap[dbState] || 'unknown',
            stateCode: dbState
        }
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});