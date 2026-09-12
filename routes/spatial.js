const express = require('express');
const router = express.Router();
const db = require('../db/postgres');
const WorkerProfile = require('../models/WorkerProfile');

/**
 * GET /api/spatial/nearby-workers
 * Query params: lat, lng, radiusKm, skill
 * Finds nearby cooperative workers using PostGIS ST_DWithin (or MongoDB fallback)
 */
router.get('/nearby-workers', async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat) || 19.0760;
        const lng = parseFloat(req.query.lng) || 72.8777;
        const radiusMeters = (parseFloat(req.query.radiusKm) || 5) * 1000;
        const skill = req.query.skill;

        if (db.isReady()) {
            // PostGIS High-Performance Spatial Query
            let query = `
                SELECT 
                    worker_id,
                    worker_name,
                    trade_skill,
                    rating,
                    fairness_score,
                    is_online,
                    is_busy,
                    ST_Y(location::geometry) as latitude,
                    ST_X(location::geometry) as longitude,
                    ROUND(ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)::numeric, 0) AS distance_meters
                FROM worker_locations
                WHERE is_online = true
                  AND ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
            `;
            const params = [lng, lat, radiusMeters];

            if (skill) {
                query += ` AND trade_skill = $4`;
                params.push(skill);
            }

            query += ` ORDER BY distance_meters ASC, fairness_score DESC LIMIT 20;`;

            const result = await db.query(query, params);
            return res.json({
                success: true,
                engine: 'PostGIS (PostgreSQL)',
                count: result.rows.length,
                data: result.rows
            });
        }

        // MongoDB GeoJSON Fallback
        const filter = {
            isOnline: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radiusMeters
                }
            }
        };

        if (skill) {
            filter.skills = skill;
        }

        const workers = await WorkerProfile.find(filter).populate('user', 'displayName phoneNumber').limit(20);

        return res.json({
            success: true,
            engine: 'MongoDB GeoJSON Fallback',
            count: workers.length,
            data: workers.map(w => ({
                worker_id: w._id,
                worker_name: w.user ? w.user.displayName : 'Cooperative Worker',
                trade_skill: w.skills && w.skills.length ? w.skills[0] : 'General',
                rating: w.ratingAverage,
                latitude: w.location.coordinates[1],
                longitude: w.location.coordinates[0],
                is_online: w.isOnline
            }))
        });
    } catch (err) {
        console.error('Spatial query error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/spatial/update-location
 * Updates worker live GPS point in PostGIS
 */
router.post('/update-location', async (req, res) => {
    try {
        const { workerId, workerName, skill, latitude, longitude } = req.body;
        if (!workerId || latitude == null || longitude == null) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        if (db.isReady()) {
            const query = `
                INSERT INTO worker_locations (worker_id, worker_name, trade_skill, location, last_ping)
                VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), CURRENT_TIMESTAMP)
                ON CONFLICT (worker_id) DO UPDATE 
                SET location = EXCLUDED.location, last_ping = CURRENT_TIMESTAMP;
            `;
            await db.query(query, [workerId, workerName || 'Worker', skill || 'general', longitude, latitude]);
        }

        // Also sync to MongoDB if worker exists
        await WorkerProfile.findOneAndUpdate(
            { user: workerId },
            { 'location.coordinates': [longitude, latitude] }
        ).catch(() => {});

        res.json({ success: true, message: 'Location updated in spatial database' });
    } catch (err) {
        console.error('Location update error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/spatial/demand-heatmap
 * Returns spatial clusters of service requests
 */
router.get('/demand-heatmap', async (req, res) => {
    // Default simulated hotspots for Mumbai / Pune cooperative areas
    const hotspots = [
        { lat: 19.0596, lng: 72.8360, name: 'Bandra West', demandCount: 18, highDemandSkill: 'Electrical' },
        { lat: 19.0680, lng: 72.8420, name: 'Khar West', demandCount: 12, highDemandSkill: 'Plumbing' },
        { lat: 19.0820, lng: 72.8390, name: 'Santacruz', demandCount: 15, highDemandSkill: 'Carpentry' },
        { lat: 19.0650, lng: 72.8777, name: 'BKC Commercial', demandCount: 24, highDemandSkill: 'Cleaning' },
        { lat: 19.0176, lng: 72.8479, name: 'Dadar Market', demandCount: 29, highDemandSkill: 'Electrical' },
    ];

    res.json({
        success: true,
        hotspots
    });
});

module.exports = router;
