const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const User = require('../models/User');

let firebaseInitialized = false;

try {
    const rootDir = path.resolve(__dirname, '..');
    const files = fs.readdirSync(rootDir);
    const serviceAccountFile = files.find(f => f.includes('firebase-adminsdk') && f.endsWith('.json'));

    if (serviceAccountFile) {
        const serviceAccountPath = path.join(rootDir, serviceAccountFile);
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

        if (!getApps().length) {
            initializeApp({
                credential: cert(serviceAccount)
            });
        }
        firebaseInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully!');
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        if (!getApps().length) {
            initializeApp({
                credential: cert(serviceAccount)
            });
        }
        firebaseInitialized = true;
        console.log('✅ Firebase Admin SDK initialized via ENV key!');
    } else {
        console.warn('⚠️ Firebase service account key not found. Running in development auth mode.');
    }
} catch (error) {
    console.warn('⚠️ Firebase Admin initialization notice:', error.message);
}

/**
 * Middleware to verify Firebase ID Token from Authorization header
 */
async function verifyAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        // In local development mode: if x-dev-uid header is provided, use mock auth
        if (req.headers['x-dev-uid']) {
            const devUid = req.headers['x-dev-uid'];
            let dbUser = await User.findOne({ firebaseUid: devUid });
            if (!dbUser) {
                dbUser = await User.create({
                    firebaseUid: devUid,
                    displayName: req.headers['x-dev-name'] || 'Dev User',
                    role: req.headers['x-dev-role'] || 'customer'
                });
            }
            req.user = { uid: devUid, email: dbUser.email };
            req.dbUser = dbUser;
            req.userRole = dbUser.role;
            return next();
        }

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Missing or invalid Authorization header. Expected Bearer token.'
            });
        }

        const token = authHeader.split('Bearer ')[1].trim();
        let decodedUser = null;

        if (firebaseInitialized) {
            try {
                decodedUser = await getAuth().verifyIdToken(token);
            } catch (fbErr) {
                if (process.env.NODE_ENV === 'production') {
                    return res.status(401).json({
                        success: false,
                        error: 'Unauthorized: Invalid or expired Firebase ID Token'
                    });
                }
                console.warn('Firebase token verify warning:', fbErr.message);
            }
        }

        const uid = decodedUser?.uid || token;
        let dbUser = await User.findOne({ firebaseUid: uid });

        if (!dbUser && decodedUser) {
            dbUser = await User.create({
                firebaseUid: decodedUser.uid,
                email: decodedUser.email || '',
                phoneNumber: decodedUser.phone_number || '',
                displayName: decodedUser.name || 'Sahakar Member',
                role: 'customer'
            });
        }

        req.user = decodedUser || { uid };
        req.dbUser = dbUser;
        req.userRole = dbUser?.role || 'customer';

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication internal error'
        });
    }
}

/**
 * RBAC guard middleware
 */
function requireRole(allowedRoles) {
    return (req, res, next) => {
        const userRole = req.userRole || 'customer';
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] roles. Your role is '${userRole}'.`
            });
        }
        next();
    };
}

module.exports = {
    verifyAuth,
    requireRole
};
