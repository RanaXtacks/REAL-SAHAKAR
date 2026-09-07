const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const ServiceCategory = require('../models/ServiceCategory');
const { verifyAuth } = require('../middleware/auth');

/**
 * POST /api/bookings
 * Customer: Create a new service booking request
 */
router.post('/', verifyAuth, async (req, res) => {
    try {
        const { serviceId, streetAddress, city, pincode, coordinates, scheduledAt, notes } = req.body;

        if (!serviceId || !streetAddress) {
            return res.status(400).json({
                success: false,
                error: 'Service ID and Street Address are required.'
            });
        }

        // Verify service exists
        const service = await ServiceCategory.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Selected service category not found.'
            });
        }

        const basePrice = service.basePrice;
        const convenienceFee = 20;
        const totalAmount = basePrice + convenienceFee;

        // Construct booking record
        const booking = new Booking({
            customer: req.dbUser._id,
            service: service._id,
            status: 'pending',
            serviceAddress: {
                streetAddress,
                city: city || 'Mumbai',
                pincode: pincode || '',
                location: {
                    type: 'Point',
                    coordinates: coordinates || [72.8777, 19.0760] // [lng, lat]
                }
            },
            scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
            notes: notes || '',
            pricing: {
                basePrice,
                convenienceFee,
                totalAmount,
                paymentStatus: 'pending'
            }
        });

        await booking.save();
        await booking.populate('service', 'name slug basePrice iconName');
        await booking.populate('customer', 'displayName phoneNumber email');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully and queued for dispatch.',
            data: booking
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/bookings/my
 * Customer/Worker: Retrieve my bookings list
 */
router.get('/my', verifyAuth, async (req, res) => {
    try {
        const user = req.dbUser;
        const query = user.role === 'worker' ? { worker: user._id } : { customer: user._id };

        const bookings = await Booking.find(query)
            .populate('service', 'name slug basePrice iconName')
            .populate('worker', 'displayName phoneNumber profilePhotoUrl')
            .populate('customer', 'displayName phoneNumber')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/bookings/:id
 * Retrieve details for a single booking
 */
router.get('/:id', verifyAuth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('service')
            .populate('customer', 'displayName phoneNumber email profilePhotoUrl')
            .populate('worker', 'displayName phoneNumber profilePhotoUrl');

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        // Check permission (must be owner, assigned worker, or admin)
        const userId = req.dbUser._id.toString();
        const isCustomer = booking.customer?._id.toString() === userId;
        const isWorker = booking.worker?._id.toString() === userId;
        const isAdmin = req.userRole === 'admin';

        if (!isCustomer && !isWorker && !isAdmin) {
            return res.status(403).json({ success: false, error: 'Unauthorized to view this booking' });
        }

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PATCH /api/bookings/:id/cancel
 * Cancel a booking
 */
router.patch('/:id/cancel', verifyAuth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot cancel a booking that is already ${booking.status}`
            });
        }

        booking.status = 'cancelled';
        booking.timeline.push({
            status: 'cancelled',
            changedAt: new Date(),
            note: req.body.reason || 'Cancelled by user'
        });

        await booking.save();

        res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
