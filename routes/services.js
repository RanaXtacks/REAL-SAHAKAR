const express = require('express');
const router = express.Router();
const ServiceCategory = require('../models/ServiceCategory');
const { verifyAuth, requireRole } = require('../middleware/auth');

// Default initial categories for seed
const DEFAULT_CATEGORIES = [
    {
        name: 'Plumbing Services',
        slug: 'plumbing',
        description: 'Leak repairs, tap fittings, pipe maintenance & drain cleaning',
        iconName: 'Wrench',
        basePrice: 299,
        estimatedDurationMinutes: 60
    },
    {
        name: 'Electrical Repairs',
        slug: 'electrical',
        description: 'Wiring, switchboard fixes, fan/light installations & MCB tripping',
        iconName: 'Zap',
        basePrice: 249,
        estimatedDurationMinutes: 45
    },
    {
        name: 'Carpentry & Woodwork',
        slug: 'carpentry',
        description: 'Door lock repair, furniture assembly, hinge fixes & custom shelving',
        iconName: 'Hammer',
        basePrice: 349,
        estimatedDurationMinutes: 90
    },
    {
        name: 'Home Appliance Repair',
        slug: 'appliances',
        description: 'AC servicing, washing machine, refrigerator & microwave repair',
        iconName: 'Cpu',
        basePrice: 399,
        estimatedDurationMinutes: 75
    },
    {
        name: 'Deep Cleaning & Sanitization',
        slug: 'cleaning',
        description: 'Full home deep cleaning, kitchen degreasing & bathroom sanitization',
        iconName: 'Sparkles',
        basePrice: 599,
        estimatedDurationMinutes: 120
    },
    {
        name: 'Painting & Waterproofing',
        slug: 'painting',
        description: 'Wall touch-ups, single room painting, ceiling waterproofing & damp fix',
        iconName: 'Paintbrush',
        basePrice: 799,
        estimatedDurationMinutes: 180
    }
];

/**
 * GET /api/services
 * Public: List all active services (auto-seeds if database collection is empty)
 */
router.get('/', async (req, res) => {
    try {
        let categories = await ServiceCategory.find({ isActive: true }).sort({ name: 1 });

        // Auto-seed default cooperative service categories on first request
        if (categories.length === 0) {
            console.log('🌱 Seeding initial service categories into MongoDB...');
            categories = await ServiceCategory.insertMany(DEFAULT_CATEGORIES);
        }

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/services/:id
 * Public: Get single service details
 */
router.get('/:id', async (req, res) => {
    try {
        const category = await ServiceCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, error: 'Service category not found' });
        }
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/services
 * Admin only: Create a new service category
 */
router.post('/', verifyAuth, requireRole(['admin']), async (req, res) => {
    try {
        const { name, slug, description, iconName, basePrice, estimatedDurationMinutes } = req.body;

        if (!name || !slug || !basePrice) {
            return res.status(400).json({ success: false, error: 'Name, slug, and basePrice are required' });
        }

        const newCategory = await ServiceCategory.create({
            name,
            slug: slug.toLowerCase(),
            description,
            iconName: iconName || 'Wrench',
            basePrice,
            estimatedDurationMinutes: estimatedDurationMinutes || 60
        });

        res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
