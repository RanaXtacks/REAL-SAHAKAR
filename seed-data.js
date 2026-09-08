const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const WorkerProfile = require('./models/WorkerProfile');
const ServiceCategory = require('./models/ServiceCategory');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

// Bengaluru / Mumbai Coordinates for Realistic Geospatial Testing
// Dadar / Bandra (Mumbai) & Koramangala / Indiranagar / HSR (Bengaluru)
const SEED_WORKERS = [
    {
        name: 'Ramesh Sharma',
        phone: '9820112233',
        email: 'ramesh.sharma@sahakar.coop',
        role: 'worker',
        skills: ['Electrical Repairs', 'Electrician', 'Wiring'],
        experienceYears: 6,
        ratingAverage: 4.9,
        totalRatingsCount: 142,
        totalJobsCompleted: 156,
        location: [72.8427, 19.0178], // Dadar, Mumbai (or 77.6245, 12.9352 for Blr)
        lastJobAssignedAt: new Date(Date.now() - 36 * 3600 * 1000) // 36 hrs ago (high rotation fairness)
    },
    {
        name: 'Suresh Kumar',
        phone: '9820223344',
        email: 'suresh.kumar@sahakar.coop',
        role: 'worker',
        skills: ['Plumbing Services', 'Plumber', 'Pipe Fitting'],
        experienceYears: 8,
        ratingAverage: 4.8,
        totalRatingsCount: 210,
        totalJobsCompleted: 230,
        location: [72.8402, 19.0596], // Bandra, Mumbai
        lastJobAssignedAt: new Date(Date.now() - 48 * 3600 * 1000) // 48 hrs ago
    },
    {
        name: 'Vijay Tendulkar',
        phone: '9820334455',
        email: 'vijay.t@sahakar.coop',
        role: 'worker',
        skills: ['Electrical Repairs', 'Electrician'],
        experienceYears: 3,
        ratingAverage: 4.7,
        totalRatingsCount: 88,
        totalJobsCompleted: 95,
        location: [72.8500, 19.0300], // Matunga, Mumbai
        lastJobAssignedAt: new Date(Date.now() - 12 * 3600 * 1000) // 12 hrs ago
    },
    {
        name: 'Anand Patil',
        phone: '9820445566',
        email: 'anand.patil@sahakar.coop',
        role: 'worker',
        skills: ['Home Appliance Repair', 'AC Repair', 'Appliances'],
        experienceYears: 5,
        ratingAverage: 4.9,
        totalRatingsCount: 175,
        totalJobsCompleted: 180,
        location: [72.8350, 19.0200], // Prabhadevi, Mumbai
        lastJobAssignedAt: new Date(Date.now() - 72 * 3600 * 1000) // 72 hrs ago
    },
    {
        name: 'Manoj Rane',
        phone: '9820556677',
        email: 'manoj.rane@sahakar.coop',
        role: 'worker',
        skills: ['Carpentry & Woodwork', 'Carpentry', 'Furniture'],
        experienceYears: 7,
        ratingAverage: 4.9,
        totalRatingsCount: 130,
        totalJobsCompleted: 140,
        location: [72.8600, 19.0400], // Sion, Mumbai
        lastJobAssignedAt: new Date(Date.now() - 24 * 3600 * 1000)
    },
    {
        name: 'Sunita Deshmukh',
        phone: '9820667788',
        email: 'sunita.d@sahakar.coop',
        role: 'worker',
        skills: ['Deep Cleaning & Sanitization', 'Cleaning'],
        experienceYears: 4,
        ratingAverage: 4.8,
        totalRatingsCount: 95,
        totalJobsCompleted: 110,
        location: [72.8450, 19.0250], // Dadar East, Mumbai
        lastJobAssignedAt: new Date(Date.now() - 50 * 3600 * 1000)
    },
    {
        name: 'Rahul Kulkarni',
        phone: '9820778899',
        email: 'rahul.k@sahakar.coop',
        role: 'worker',
        skills: ['Plumbing Services', 'Plumber'],
        experienceYears: 4,
        ratingAverage: 4.9,
        totalRatingsCount: 65,
        totalJobsCompleted: 70,
        location: [72.8420, 19.0180], // Dadar West, Mumbai (very close to Dadar center)
        lastJobAssignedAt: new Date(Date.now() - 18 * 3600 * 1000)
    }
];

const SEED_CATEGORIES = [
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

async function seedDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');

        // 1. Seed Service Categories
        console.log('📦 Seeding Service Categories...');
        for (const cat of SEED_CATEGORIES) {
            await ServiceCategory.findOneAndUpdate(
                { slug: cat.slug },
                cat,
                { upsert: true, new: true }
            );
        }
        console.log(`✅ ${SEED_CATEGORIES.length} Service Categories upserted`);

        // 2. Seed Workers and WorkerProfiles
        console.log('👷 Seeding Cooperative Workers...');
        for (const workerData of SEED_WORKERS) {
            const devUid = `worker-${workerData.phone}`;

            // Upsert User
            const user = await User.findOneAndUpdate(
                { firebaseUid: devUid },
                {
                    firebaseUid: devUid,
                    displayName: workerData.name,
                    phoneNumber: workerData.phone,
                    email: workerData.email,
                    role: 'worker',
                    walletBalance: 2400
                },
                { upsert: true, new: true }
            );

            // Upsert WorkerProfile with GeoJSON coordinates
            await WorkerProfile.findOneAndUpdate(
                { user: user._id },
                {
                    user: user._id,
                    skills: workerData.skills,
                    experienceYears: workerData.experienceYears,
                    ratingAverage: workerData.ratingAverage,
                    totalRatingsCount: workerData.totalRatingsCount,
                    totalJobsCompleted: workerData.totalJobsCompleted,
                    isOnline: true,
                    isBusy: false,
                    kycStatus: 'verified',
                    lastJobAssignedAt: workerData.lastJobAssignedAt,
                    location: {
                        type: 'Point',
                        coordinates: workerData.location // [lng, lat]
                    }
                },
                { upsert: true, new: true }
            );

            console.log(`   ✓ Seeded Worker: ${workerData.name} (${workerData.skills.join(', ')})`);
        }

        console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();
