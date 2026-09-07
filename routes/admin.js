const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const ServiceCategory = require('../models/ServiceCategory');
const { verifyAuth, requireRole } = require('../middleware/auth');

// All admin routes require admin role
router.use(verifyAuth, requireRole(['admin']));

/**
 * GET /api/admin/stats
 * Overview numbers for the cooperative platform dashboard
 */
router.get('/stats', async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const activeBookings = await Booking.countDocuments({ status: { $in: ['accepted', 'en_route', 'arrived', 'in_progress'] } });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });

        const totalWorkers = await WorkerProfile.countDocuments();
        const onlineWorkers = await WorkerProfile.countDocuments({ isOnline: true });
        const totalCustomers = await User.countDocuments({ role: 'customer' });

        // Calculate total gross volume from paid bookings
        const revenueAgg = await Booking.aggregate([
            { $match: { 'pricing.paymentStatus': 'paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$pricing.totalAmount' } } }
        ]);

        const grossRevenue = revenueAgg[0]?.totalRevenue || 0;

        res.json({
            success: true,
            stats: {
                totalBookings,
                pendingBookings,
                activeBookings,
                completedBookings,
                totalWorkers,
                onlineWorkers,
                totalCustomers,
                grossRevenue,
                welfareFundBalance: Math.round(grossRevenue * 0.03) // 3% cooperative welfare fund
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/admin/bookings
 * List all bookings across the entire cooperative
 */
router.get('/bookings', async (req, res) => {
    try {
        const { status, limit = 50, page = 1 } = req.query;
        const filter = status ? { status } : {};

        const bookings = await Booking.find(filter)
            .populate('service', 'name slug basePrice')
            .populate('customer', 'displayName phoneNumber email')
            .populate('worker', 'displayName phoneNumber')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Booking.countDocuments(filter);

        res.json({
            success: true,
            total,
            page: parseInt(page),
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/admin/workers
 * List all workers with their profile metrics
 */
router.get('/workers', async (req, res) => {
    try {
        const workers = await WorkerProfile.find()
            .populate('user', 'displayName phoneNumber email profilePhotoUrl isActive')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: workers.length,
            data: workers
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
