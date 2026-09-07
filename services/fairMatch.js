const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');

/**
 * Calculate Haversine distance between two coordinates in meters
 * @param {[number, number]} coord1 [longitude, latitude]
 * @param {[number, number]} coord2 [longitude, latitude]
 * @returns {number} distance in meters
 */
function calculateDistanceMeters(coord1, coord2) {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371e3; // Earth radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;

    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaPhi = toRad(lat2 - lat1);
    const deltaLambda = toRad(lon2 - lon1);

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

/**
 * XGBoost-style acceptance probability scoring function
 * Simulates a trained gradient boosted decision tree classifier output
 * predicting probability of worker accepting job given local features.
 */
function calculateXGBoostProbability({ distanceKm, idleHours, ratingAvg, experienceYears }) {
    // Feature weights derived from simulated XGBoost log-odds
    const intercept = 0.5;
    const wDistance = -0.35;    // Closer workers have higher acceptance probability
    const wIdle = 0.25;         // Longer idle workers are more eager to accept
    const wRating = 0.15;       // Consistent performers accept more reliably
    const wExperience = 0.05;   // Seasoned workers manage schedules better

    const z = intercept +
              (wDistance * Math.min(distanceKm, 10)) +
              (wIdle * Math.min(idleHours / 24, 3)) +
              (wRating * (ratingAvg - 3)) +
              (wExperience * Math.min(experienceYears, 10));

    // Sigmoid function mapping to [0.05, 0.98]
    const prob = 1 / (1 + Math.exp(-z));
    return parseFloat(Math.min(0.98, Math.max(0.05, prob)).toFixed(3));
}

/**
 * Category-Specific Geospatial + XGBoost Fair-Match Ranking Engine
 * 
 * Multi-Factor Scoring Formula:
 * Final Score = (0.40 * Proximity) + (0.30 * Rotation Fairness) + (0.20 * Rating) + (0.10 * XGBoost Acceptance)
 * 
 * @param {Object} booking Mongoose booking document
 * @param {number} maxRadiusMeters Maximum search radius (default: 8000m / 8km)
 * @returns {Promise<Array>} Ranked candidate list with full explainability metadata
 */
async function rankWorkersForBooking(booking, maxRadiusMeters = 8000) {
    const serviceCoordinates = booking.serviceAddress?.location?.coordinates || [72.8777, 19.0760];
    const categoryName = booking.service?.name || booking.service?.slug || '';

    // Step 1: Query online and non-busy workers
    const query = {
        isOnline: true,
        isBusy: false
    };

    // Filter by trade skill if service category provided
    if (categoryName) {
        query.skills = { $regex: new RegExp(categoryName, 'i') };
    }

    // Try geospatial nearSphere query if 2dsphere index is active
    let candidateProfiles = [];
    try {
        candidateProfiles = await WorkerProfile.find({
            ...query,
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: serviceCoordinates
                    },
                    $maxDistance: maxRadiusMeters
                }
            }
        }).populate('user', 'displayName phoneNumber email profilePhotoUrl activeRole');
    } catch (geoError) {
        // Fallback to manual Haversine filtering if index is building or mock coordinates
        console.warn('Geospatial index fallback:', geoError.message);
        const allOnline = await WorkerProfile.find(query).populate('user', 'displayName phoneNumber email profilePhotoUrl');
        candidateProfiles = allOnline.filter(wp => {
            const coords = wp.location?.coordinates || [72.8777, 19.0760];
            const dist = calculateDistanceMeters(serviceCoordinates, coords);
            return dist <= maxRadiusMeters;
        });
    }

    if (!candidateProfiles || candidateProfiles.length === 0) {
        return [];
    }

    const now = Date.now();

    // Step 2: Compute multi-factor explainable scores
    const scoredCandidates = candidateProfiles.map(wp => {
        const workerCoords = wp.location?.coordinates || [72.8777, 19.0760];
        const distanceMeters = calculateDistanceMeters(serviceCoordinates, workerCoords);
        const distanceKm = distanceMeters / 1000;

        // Factor 1: Proximity Score (0.0 to 1.0)
        // 0m = 1.0, 8000m = 0.0
        const proximityScore = Math.max(0, 1 - (distanceMeters / maxRadiusMeters));

        // Factor 2: Rotation Fairness Score (0.0 to 1.0)
        // Workers who haven't had a job recently get higher priority to prevent monopoly
        const lastAssignedTime = wp.lastJobAssignedAt ? new Date(wp.lastJobAssignedAt).getTime() : 0;
        const idleMillis = now - lastAssignedTime;
        const idleHours = idleMillis / (1000 * 60 * 60);
        // Normalized over 48 hours
        const rotationScore = Math.min(1, idleHours / 48);

        // Factor 3: Performance & Rating Score (0.0 to 1.0)
        const ratingAvg = wp.ratingAverage || 5.0;
        const ratingScore = Math.min(1, Math.max(0, ratingAvg / 5.0));

        // Factor 4: XGBoost Predicted Acceptance Probability (0.0 to 1.0)
        const xgbAcceptanceProb = calculateXGBoostProbability({
            distanceKm,
            idleHours,
            ratingAvg,
            experienceYears: wp.experienceYears || 1
        });

        // Composite Weighted Total (0 to 100 scale for intuitive UI display)
        const totalScore = (
            (proximityScore * 0.40) +
            (rotationScore * 0.30) +
            (ratingScore * 0.20) +
            (xgbAcceptanceProb * 0.10)
        ) * 100;

        return {
            workerProfileId: wp._id,
            user: wp.user,
            distanceMeters,
            distanceKm: parseFloat(distanceKm.toFixed(2)),
            scores: {
                proximity: parseFloat((proximityScore * 100).toFixed(1)),
                rotationFairness: parseFloat((rotationScore * 100).toFixed(1)),
                rating: parseFloat((ratingScore * 100).toFixed(1)),
                xgbProbability: parseFloat((xgbAcceptanceProb * 100).toFixed(1)),
                total: parseFloat(totalScore.toFixed(1))
            },
            skills: wp.skills,
            experienceYears: wp.experienceYears,
            ratingAverage: wp.ratingAverage
        };
    });

    // Step 3: Sort candidates by total score descending
    scoredCandidates.sort((a, b) => b.scores.total - a.scores.total);

    return scoredCandidates;
}

module.exports = {
    rankWorkersForBooking,
    calculateDistanceMeters,
    calculateXGBoostProbability
};
