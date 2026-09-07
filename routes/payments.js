const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { verifyAuth } = require('../middleware/auth');
const { processBookingPayment, calculateCooperativeSplit } = require('../services/payment');

/**
 * GET /api/payments/preview-split/:bookingId
 * Returns the 88/5/4/3 cooperative breakdown preview for a booking
 */
router.get('/preview-split/:bookingId', verifyAuth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        const split = calculateCooperativeSplit(booking.pricing.totalAmount);
        res.json({ success: true, split });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/payments/confirm
 * Customer or Worker confirms payment (either Online via Razorpay or Cash on Delivery)
 */
router.post('/confirm', verifyAuth, async (req, res) => {
    try {
        const { bookingId, method, razorpayPaymentId, razorpayOrderId } = req.body;

        if (!bookingId || !method) {
            return res.status(400).json({
                success: false,
                error: 'bookingId and method (razorpay or cash) are required.'
            });
        }

        if (!['razorpay', 'cash'].includes(method)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment method. Allowed: razorpay, cash.'
            });
        }

        const io = req.app.get('io');
        const result = await processBookingPayment(
            bookingId,
            {
                method,
                razorpayPaymentId,
                razorpayOrderId
            },
            io
        );

        res.json({
            success: true,
            message: `Payment confirmed via ${method.toUpperCase()} and cooperative 88/5/4/3 split executed.`,
            data: result
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
