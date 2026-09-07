const dns = require('dns');
// Use Google & Cloudflare DNS to ensure reliable MongoDB SRV lookup across local networks
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // Fallback gracefully in restricted environments
}

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
    console.error('❌ ERROR: MONGODB_URI is not defined in .env file');
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ MongoDB Connected Successfully!'))
        .catch(err => console.error('❌ Database connection error:', err.message));
}

// Root welcome route
app.get('/', (req, res) => {
    res.json({
        name: 'SahakarConnect Cooperative API',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            health: 'GET /health',
            services: 'GET /api/services',
            auth: 'POST /api/auth/sync',
            bookings: 'POST /api/bookings',
            admin: 'GET /api/admin/stats'
        }
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

// Mount Feature API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.url}`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 SahakarConnect API running on http://localhost:${PORT}`);
});