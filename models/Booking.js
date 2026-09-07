const mongoose = require('mongoose');

const bookingTimelineSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true
    },
    changedAt: {
        type: Date,
        default: Date.now
    },
    note: String
}, { _id: false });

const bookingSchema = new mongoose.Schema({
    bookingNumber: {
        type: String,
        unique: true,
        default: () => 'SC-' + Math.floor(100000 + Math.random() * 900000)
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceCategory',
        required: true
    },
    status: {
        type: String,
        enum: [
            'pending',     // Created, awaiting Fair-Match dispatch
            'offered',     // Sent to worker via Socket.io
            'accepted',    // Worker accepted
            'en_route',    // Worker traveling
            'arrived',     // Worker on site
            'in_progress', // Job started
            'completed',   // Finished & ready for payment
            'cancelled'    // Cancelled by customer or timeout
        ],
        default: 'pending',
        index: true
    },
    serviceAddress: {
        streetAddress: {
            type: String,
            required: true
        },
        city: {
            type: String,
            default: 'Mumbai'
        },
        pincode: String,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [72.8777, 19.0760]
            }
        }
    },
    scheduledAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    },
    pricing: {
        basePrice: {
            type: Number,
            required: true
        },
        convenienceFee: {
            type: Number,
            default: 20
        },
        totalAmount: {
            type: Number,
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending'
        },
        razorpayOrderId: String,
        razorpayPaymentId: String
    },
    rating: {
        score: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        ratedAt: Date
    },
    timeline: [bookingTimelineSchema]
}, {
    timestamps: true
});

// Auto-push initial timeline entry
bookingSchema.pre('save', function() {
    if (this.isNew && this.timeline.length === 0) {
        this.timeline.push({
            status: this.status,
            changedAt: new Date(),
            note: 'Booking requested by customer'
        });
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
