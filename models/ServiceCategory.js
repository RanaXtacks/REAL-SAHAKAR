const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    iconName: {
        type: String,
        default: 'Wrench'
    },
    basePrice: {
        type: Number,
        required: true,
        min: 0
    },
    estimatedDurationMinutes: {
        type: Number,
        default: 60
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
