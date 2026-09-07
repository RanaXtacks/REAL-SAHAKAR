const dns = require('dns');
// Set public DNS servers to resolve MongoDB SRV records reliably on Windows
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
}

const TestSchema = new mongoose.Schema({
    message: String,
    testedAt: { type: Date, default: Date.now }
});

const TestModel = mongoose.model('HealthCheckTest', TestSchema);

async function verifyDatabase() {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    console.log('🔄 Writing test document...');
    const created = await TestModel.create({ message: 'SahakarConnect Phase 1 DB Test' });
    console.log('✅ Document created with ID:', created._id);

    console.log('🔄 Reading test document back...');
    const fetched = await TestModel.findById(created._id);
    console.log('✅ Document read back successfully:', fetched.message);

    console.log('🔄 Cleaning up test document...');
    await TestModel.deleteOne({ _id: created._id });
    console.log('✅ Cleaned up successfully.');

    await mongoose.disconnect();
    console.log('🎉 MongoDB Round-Trip Test PASSED!');
}

verifyDatabase().catch((err) => {
    console.error('❌ Test failed with error:', err.message);
    process.exit(1);
});
