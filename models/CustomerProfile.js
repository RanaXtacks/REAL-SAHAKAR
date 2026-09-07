const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    label: {
        type: String,
        default: 'Home'
    },
    flatNo: String,
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
    },
    isDefault: {
        type: Boolean,
        default: false
    }
});

const customerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    addresses: [addressSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('CustomerProfile', customerProfileSchema);
