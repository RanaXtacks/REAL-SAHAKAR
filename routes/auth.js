const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const CustomerProfile = require('../models/CustomerProfile');
const { verifyAuth } = require('../middleware/auth');

/**
 * POST /api/auth/sync
 * Called after Firebase sign-in/sign-up to ensure MongoDB record is created or updated.
 */
router.post('/sync', verifyAuth, async (req, res) => {
    try {
        const { role, displayName, phoneNumber, email, profilePhotoUrl, skills, coordinates } = req.body;

        let user = req.dbUser;

        if (!user) {
            user = new User({
                firebaseUid: req.user.uid,
                email: email || req.user.email || '',
                phoneNumber: phoneNumber || req.user.phone_number || '',
                displayName: displayName || req.user.name || 'Sahakar Member',
                role: role || 'customer',
                profilePhotoUrl: profilePhotoUrl || ''
            });
            await user.save();
        } else {
            // Update profile fields if provided
            if (displayName) user.displayName = displayName;
            if (phoneNumber) user.phoneNumber = phoneNumber;
            if (email) user.email = email;
            if (role && ['customer', 'worker', 'admin'].includes(role)) user.role = role;
            if (profilePhotoUrl) user.profilePhotoUrl = profilePhotoUrl;
            await user.save();
        }

        // If worker, ensure WorkerProfile exists
        let profile = null;
        if (user.role === 'worker') {
            profile = await WorkerProfile.findOne({ user: user._id });
            if (!profile) {
                profile = await WorkerProfile.create({
                    user: user._id,
                    skills: skills || ['General Repairs'],
                    isOnline: true,
                    location: coordinates ? { type: 'Point', coordinates } : undefined
                });
            } else if (coordinates || skills) {
                if (coordinates) profile.location = { type: 'Point', coordinates };
                if (skills) profile.skills = skills;
                await profile.save();
            }
        } else if (user.role === 'customer') {
            // Ensure CustomerProfile exists
            profile = await CustomerProfile.findOne({ user: user._id });
            if (!profile) {
                profile = await CustomerProfile.create({
                    user: user._id,
                    addresses: []
                });
            }
        }

        res.json({
            success: true,
            user,
            profile
        });
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user and linked profile.
 */
router.get('/me', verifyAuth, async (req, res) => {
    try {
        const user = req.dbUser;
        if (!user) {
            return res.status(404).json({ success: false, error: 'User profile not found' });
        }

        let profile = null;
        if (user.role === 'worker') {
            profile = await WorkerProfile.findOne({ user: user._id });
        } else if (user.role === 'customer') {
            profile = await CustomerProfile.findOne({ user: user._id });
        }

        res.json({
            success: true,
            user,
            profile
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/auth/switch-role
 * Toggles active role between 'customer' and 'worker'
 */
router.post('/switch-role', verifyAuth, async (req, res) => {
    try {
        const user = req.dbUser;
        const { targetRole } = req.body;

        const newRole = targetRole && ['customer', 'worker'].includes(targetRole)
            ? targetRole
            : (user.role === 'worker' ? 'customer' : 'worker');

        user.role = newRole;
        await user.save();

        let profile = null;
        if (newRole === 'worker') {
            profile = await WorkerProfile.findOne({ user: user._id });
        } else {
            profile = await CustomerProfile.findOne({ user: user._id });
        }

        res.json({
            success: true,
            message: `Role switched to ${newRole}`,
            user,
            profile
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
