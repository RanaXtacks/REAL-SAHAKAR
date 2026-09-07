const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    experienceYears: {
        type: Number,
        default: 1
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [72.8777, 19.0760] // default fallback coordinates (Mumbai)
        }
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    isBusy: {
        type: Boolean,
        default: false
    },
    totalJobsCompleted: {
        type: Number,
        default: 0
    },
    lastJobAssignedAt: {
        type: Date,
        default: () => new Date(0) // Start with oldest date so new workers get fair initial rotation
    },
    ratingAverage: {
        type: Number,
        default: 5.0,
        min: 1,
        max: 5
    },
    totalRatingsCount: {
        type: Number,
        default: 0
    },
    kycStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Create 2dsphere index for proximity search ($near queries in Phase 3)
workerProfileSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);
