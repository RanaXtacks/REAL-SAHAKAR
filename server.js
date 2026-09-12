const dns = require('dns');
// Use Google & Cloudflare DNS to ensure reliable MongoDB SRV lookup across local networks
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // Fallback gracefully in restricted environments
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS enabled for mobile clients & web dashboard
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
    }
});

// Attach io to Express app for use in routes & services
app.set('io', io);

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

// -------------------------------------------------------------------
// REALTIME SOCKET.IO EVENT HANDLERS
// -------------------------------------------------------------------
const { handleOfferAccepted, handleOfferRejected } = require('./services/dispatch');
const Booking = require('./models/Booking');

io.on('connection', (socket) => {
    console.log(`🔌 [Socket Connected] ID: ${socket.id}`);

    // Worker registers their room on app start
    socket.on('register-worker', (workerId) => {
        if (workerId) {
            socket.join(`worker:${workerId}`);
            console.log(`👷 Worker ${workerId} joined room 'worker:${workerId}' on socket ${socket.id}`);
        }
    });

    // Customer or Worker joins a booking tracking room
    socket.on('join-booking', (bookingId) => {
        if (bookingId) {
            socket.join(`booking:${bookingId}`);
            console.log(`📍 Client joined tracking room 'booking:${bookingId}' on socket ${socket.id}`);
        }
    });

    // Worker accepts incoming job offer
    socket.on('offer-accepted', async (data) => {
        const { bookingId, workerId } = data || {};
        if (bookingId && workerId) {
            console.log(`✅ Worker ${workerId} accepted offer for booking ${bookingId}`);
            try {
                await handleOfferAccepted(bookingId, workerId, io);
            } catch (err) {
                console.error('Error handling offer accepted:', err);
                socket.emit('error', { message: 'Failed to accept offer: ' + err.message });
            }
        }
    });

    // Worker rejects incoming job offer
    socket.on('offer-rejected', async (data) => {
        const { bookingId, workerId, reason } = data || {};
        if (bookingId && workerId) {
            console.log(`❌ Worker ${workerId} rejected offer for booking ${bookingId}`);
            try {
                await handleOfferRejected(bookingId, workerId, reason, io);
            } catch (err) {
                console.error('Error handling offer rejected:', err);
            }
        }
    });

    // Worker streams live GPS coordinates while en route
    socket.on('worker-location-update', (data) => {
        const { bookingId, workerId, latitude, longitude, heading } = data || {};
        if (bookingId && latitude && longitude) {
            // Relay coordinates in realtime to customer map
            io.to(`booking:${bookingId}`).emit('worker-location-stream', {
                bookingId,
                workerId,
                latitude,
                longitude,
                heading: heading || 0,
                timestamp: Date.now()
            });
        }
    });

    // Worker updates job execution milestone status (en_route -> arrived -> in_progress -> completed)
    socket.on('job-status-update', async (data) => {
        const { bookingId, status, note } = data || {};
        if (bookingId && status) {
            try {
                const booking = await Booking.findById(bookingId);
                if (booking) {
                    booking.status = status;
                    booking.timeline.push({
                        status,
                        changedAt: new Date(),
                        note: note || `Status changed to ${status}`
                    });
                    await booking.save();

                    console.log(`🔄 Booking ${booking.bookingNumber} milestone updated to: ${status}`);

                    // Broadcast update to customer tracking room
                    io.to(`booking:${bookingId}`).emit('job-status-changed', {
                        bookingId,
                        status,
                        timeline: booking.timeline,
                        note: note || '',
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (err) {
                console.error('Error updating job milestone status:', err);
            }
        }
    });

    socket.on('disconnect', (reason) => {
        console.log(`🔌 [Socket Disconnected] ID: ${socket.id} (Reason: ${reason})`);
    });
});

// -------------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------------

// Root welcome route
app.get('/', (req, res) => {
    res.json({
        name: 'SahakarConnect Cooperative API',
        version: '1.0.0',
        status: 'online',
        realtime: 'Socket.io active',
        endpoints: {
            health: 'GET /health',
            services: 'GET /api/services',
            auth: 'POST /api/auth/sync',
            bookings: 'POST /api/bookings',
            matchAudit: 'GET /api/bookings/:id/match-audit',
            payments: 'POST /api/payments/confirm',
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
        },
        socketClients: io.engine.clientsCount || 0
    });
});

// Mount Feature API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/spatial', require('./routes/spatial'));

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

// Start the HTTP + Socket.io server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 SahakarConnect API & Realtime Socket.io running on http://localhost:${PORT}`);
});