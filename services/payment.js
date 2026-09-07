const Booking = require('../models/Booking');
const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');

/**
 * Calculates the exact 88/5/4/3 Cooperative Commission Split
 * @param {number} totalAmount Total paid by customer in INR
 * @returns {Object} Calculated ledger breakdown
 */
function calculateCooperativeSplit(totalAmount) {
    const workerPayout = Math.round(totalAmount * 0.88);       // 88% Worker Direct Earnings
    const societyFee = Math.round(totalAmount * 0.05);         // 5% Primary Society Operations
    const platformFee = Math.round(totalAmount * 0.04);        // 4% Tech Platform Maintenance
    // Welfare fund takes remainder to guarantee exact zero-penny rounding match
    const welfareFund = totalAmount - (workerPayout + societyFee + platformFee); // 3% Emergency Worker Welfare

    return {
        totalAmount,
        workerPayout,
        societyFee,
        platformFee,
        welfareFund,
        percentages: {
            worker: '88%',
            society: '5%',
            platform: '4%',
            welfare: '3%'
        }
    };
}

/**
 * Process a successful payment (Razorpay Online or Cash on Delivery)
 * Updates booking status to 'completed' and records financial ledger split
 * 
 * @param {string} bookingId 
 * @param {Object} paymentData { method: 'razorpay' | 'cash', razorpayPaymentId, razorpayOrderId, collectedBy }
 * @param {Object} io Socket.io instance
 */
async function processBookingPayment(bookingId, paymentData, io) {
    const { method, razorpayPaymentId, razorpayOrderId } = paymentData;

    const booking = await Booking.findById(bookingId).populate('worker customer service');
    if (!booking) {
        throw new Error('Booking not found');
    }

    const totalAmount = booking.pricing.totalAmount;
    const split = calculateCooperativeSplit(totalAmount);

    // Update booking record
    booking.pricing.paymentStatus = 'paid';
    booking.pricing.paymentMethod = method;
    if (razorpayPaymentId) booking.pricing.razorpayPaymentId = razorpayPaymentId;
    if (razorpayOrderId) booking.pricing.razorpayOrderId = razorpayOrderId;
    booking.pricing.splitBreakdown = split;
    booking.status = 'completed';

    booking.timeline.push({
        status: 'completed',
        changedAt: new Date(),
        note: `Payment of ₹${totalAmount} verified via ${method.toUpperCase()}. Cooperative 88/5/4/3 split executed.`
    });

    await booking.save();

    // Release worker from busy state and increment completion metrics
    if (booking.worker) {
        await WorkerProfile.findOneAndUpdate(
            { user: booking.worker._id },
            {
                isBusy: false,
                $inc: { totalJobsCompleted: 1 }
            }
        );

        // Credit worker wallet balance
        await User.findByIdAndUpdate(booking.worker._id, {
            $inc: { walletBalance: split.workerPayout }
        });
    }

    console.log(`[Payment] Booking ${booking.bookingNumber} completed via ${method}. Split: Worker: ₹${split.workerPayout}, Society: ₹${split.societyFee}, Tech: ₹${split.platformFee}, Welfare: ₹${split.welfareFund}`);

    // Emit realtime event to customer and worker
    if (io) {
        io.to(`booking:${bookingId}`).emit('job-status-changed', {
            bookingId,
            status: 'completed',
            payment: {
                status: 'paid',
                method,
                totalAmount,
                split
            },
            message: 'Service marked complete and payment confirmed!',
            timestamp: new Date().toISOString()
        });

        if (booking.worker) {
            io.to(`worker:${booking.worker._id}`).emit('payment-received', {
                bookingId,
                earnings: split.workerPayout,
                split
            });
        }
    }

    return { success: true, booking, split };
}

module.exports = {
    calculateCooperativeSplit,
    processBookingPayment
};
