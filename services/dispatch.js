const Booking = require('../models/Booking');
const WorkerProfile = require('../models/WorkerProfile');
const { rankWorkersForBooking } = require('./fairMatch');

// In-memory active dispatch tracker
// Key: bookingId -> { candidates, currentIndex, offerTimer, fallbackTimer }
const activeDispatches = new Map();

const OFFER_TIMEOUT_SECONDS = 45;
const SMS_FALLBACK_TIMEOUT_SECONDS = 15;

/**
 * Start the realtime cascading dispatch pipeline for a new booking
 * @param {Object} booking Mongoose booking document
 * @param {Object} io Socket.io instance
 */
async function startDispatch(booking, io) {
    const bookingId = booking._id.toString();

    try {
        // Step 1: Query & Rank candidates via Geospatial + XGBoost Fair-Match
        const candidates = await rankWorkersForBooking(booking);

        if (!candidates || candidates.length === 0) {
            console.log(`[Dispatch] No eligible workers available for booking ${booking.bookingNumber}`);
            if (io) {
                io.to(`booking:${bookingId}`).emit('dispatch-status', {
                    bookingId,
                    status: 'no_workers_available',
                    message: 'No active workers found nearby. Re-checking in background...'
                });
            }
            return { success: false, reason: 'no_workers' };
        }

        console.log(`[Dispatch] Found ${candidates.length} candidates for booking ${booking.bookingNumber}. Top: ${candidates[0].user?.displayName || 'Worker'}`);

        // Store active dispatch state
        activeDispatches.set(bookingId, {
            booking,
            candidates,
            currentIndex: 0,
            offerTimer: null,
            fallbackTimer: null
        });

        // Step 2: Send exclusive offer to the #1 ranked candidate
        await dispatchOfferToCurrentCandidate(bookingId, io);

        return { success: true, totalCandidates: candidates.length };
    } catch (error) {
        console.error('[Dispatch] Error starting dispatch:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Dispatches the offer to the candidate at currentIndex with 45s timer and 15s SMS alert
 */
async function dispatchOfferToCurrentCandidate(bookingId, io) {
    const dispatchState = activeDispatches.get(bookingId);
    if (!dispatchState) return;

    const { booking, candidates, currentIndex } = dispatchState;
    if (currentIndex >= candidates.length) {
        console.log(`[Dispatch] All candidates exhausted for booking ${booking.bookingNumber}`);
        activeDispatches.delete(bookingId);

        await Booking.findByIdAndUpdate(bookingId, {
            status: 'pending',
            $push: {
                timeline: {
                    status: 'pending',
                    changedAt: new Date(),
                    note: 'All matching candidates unavailable or timed out.'
                }
            }
        });

        if (io) {
            io.to(`booking:${bookingId}`).emit('dispatch-status', {
                bookingId,
                status: 'candidates_exhausted',
                message: 'Nearby workers were busy. Broadcast expanding radius...'
            });
        }
        return;
    }

    const currentCandidate = candidates[currentIndex];
    const workerUserId = currentCandidate.user?._id?.toString();

    console.log(`[Dispatch] Offering booking ${booking.bookingNumber} to worker ${workerUserId} (Rank #${currentIndex + 1}, Score: ${currentCandidate.scores.total})`);

    // Update booking status to 'offered'
    await Booking.findByIdAndUpdate(bookingId, {
        status: 'offered',
        $push: {
            timeline: {
                status: 'offered',
                changedAt: new Date(),
                note: `Offered to worker ${currentCandidate.user?.displayName || workerUserId} (Score: ${currentCandidate.scores.total})`
            }
        }
    });

    const offerPayload = {
        booking: {
            _id: booking._id,
            bookingNumber: booking.bookingNumber,
            service: booking.service,
            serviceAddress: booking.serviceAddress,
            scheduledAt: booking.scheduledAt,
            pricing: booking.pricing,
            notes: booking.notes,
            customer: {
                displayName: booking.customer?.displayName || 'Customer',
                phoneNumber: booking.customer?.phoneNumber || ''
            }
        },
        timeoutSeconds: OFFER_TIMEOUT_SECONDS,
        expiresAt: Date.now() + (OFFER_TIMEOUT_SECONDS * 1000),
        candidateScore: currentCandidate.scores,
        distanceKm: currentCandidate.distanceKm
    };

    // Emit realtime offer popup to worker's socket room
    if (io) {
        io.to(`worker:${workerUserId}`).emit('new-offer', offerPayload);
        // Also inform customer that a worker has been offered
        io.to(`booking:${bookingId}`).emit('job-status-changed', {
            bookingId,
            status: 'offered',
            message: `Dispatching to nearest cooperative partner...`,
            timestamp: new Date().toISOString()
        });
    }

    // Step 3: Setup 15-second SMS/WhatsApp fallback timer
    clearTimeout(dispatchState.fallbackTimer);
    dispatchState.fallbackTimer = setTimeout(() => {
        triggerSmsFallbackAlert(currentCandidate, booking);
    }, SMS_FALLBACK_TIMEOUT_SECONDS * 1000);

    // Step 4: Setup 45-second exclusive offer expiration timer
    clearTimeout(dispatchState.offerTimer);
    dispatchState.offerTimer = setTimeout(async () => {
        console.log(`[Dispatch] Offer timed out for worker ${workerUserId} on booking ${booking.bookingNumber}. Cascading...`);
        // Notify worker device that offer expired
        if (io) {
            io.to(`worker:${workerUserId}`).emit('offer-cancelled', {
                bookingId,
                reason: 'timeout'
            });
        }
        // Auto-cascade to next candidate
        dispatchState.currentIndex += 1;
        await dispatchOfferToCurrentCandidate(bookingId, io);
    }, OFFER_TIMEOUT_SECONDS * 1000);
}

/**
 * Trigger SMS / WhatsApp fallback alert if worker hasn't acknowledged in 15 seconds
 */
function triggerSmsFallbackAlert(candidate, booking) {
    const phone = candidate.user?.phoneNumber || 'N/A';
    const name = candidate.user?.displayName || 'Sahakar Partner';
    const amount = booking.pricing?.totalAmount || 0;
    const category = booking.service?.name || 'Service';

    console.log(`📱 [SMS/WhatsApp Fallback Alert Sent]`);
    console.log(`   To: ${name} (${phone})`);
    console.log(`   Message: "🔔 NEW SAHAKAR JOB ALERT: ${category} job nearby worth ₹${amount}. Tap to open Sahakar App: https://sahakar.app/jobs/${booking._id}"`);
    // In production with Twilio credentials, this calls twilioClient.messages.create(...)
}

/**
 * Handle worker accepting an offer
 */
async function handleOfferAccepted(bookingId, workerUserId, io) {
    const dispatchState = activeDispatches.get(bookingId);
    if (dispatchState) {
        clearTimeout(dispatchState.offerTimer);
        clearTimeout(dispatchState.fallbackTimer);
        activeDispatches.delete(bookingId);
    }

    // Update Booking in DB
    const booking = await Booking.findByIdAndUpdate(bookingId, {
        worker: workerUserId,
        status: 'accepted',
        $push: {
            timeline: {
                status: 'accepted',
                changedAt: new Date(),
                note: 'Worker accepted the job'
            }
        }
    }, { new: true })
    .populate('worker', 'displayName phoneNumber profilePhotoUrl')
    .populate('customer', 'displayName phoneNumber');

    // Mark WorkerProfile as busy and record assignment time
    await WorkerProfile.findOneAndUpdate({ user: workerUserId }, {
        isBusy: true,
        lastJobAssignedAt: new Date()
    });

    console.log(`[Dispatch] Booking ${booking.bookingNumber} ACCEPTED by worker ${workerUserId}`);

    // Broadcast to customer and worker
    if (io) {
        io.to(`booking:${bookingId}`).emit('job-status-changed', {
            bookingId,
            status: 'accepted',
            worker: booking.worker,
            message: 'Worker has accepted your booking and is preparing!',
            timestamp: new Date().toISOString()
        });

        io.to(`worker:${workerUserId}`).emit('offer-confirmed', {
            bookingId,
            status: 'accepted',
            booking
        });
    }

    return booking;
}

/**
 * Handle worker rejecting an offer
 */
async function handleOfferRejected(bookingId, workerUserId, reason, io) {
    const dispatchState = activeDispatches.get(bookingId);
    if (!dispatchState) return;

    clearTimeout(dispatchState.offerTimer);
    clearTimeout(dispatchState.fallbackTimer);

    console.log(`[Dispatch] Worker ${workerUserId} REJECTED booking ${bookingId} (${reason || 'no reason'}). Cascading to next candidate...`);

    if (io) {
        io.to(`worker:${workerUserId}`).emit('offer-cancelled', {
            bookingId,
            reason: 'rejected_by_user'
        });
    }

    // Cascade to next candidate
    dispatchState.currentIndex += 1;
    await dispatchOfferToCurrentCandidate(bookingId, io);
}

module.exports = {
    startDispatch,
    handleOfferAccepted,
    handleOfferRejected,
    activeDispatches
};
