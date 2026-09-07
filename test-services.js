const { calculateDistanceMeters, calculateXGBoostProbability } = require('./services/fairMatch');
const { calculateCooperativeSplit } = require('./services/payment');

console.log('🧪 RUNNING CORE ENGINE TESTS...\n');

// Test 1: Distance calculation
// Dadar (72.8427, 19.0178) to Bandra (72.8402, 19.0596) in Mumbai
const dadar = [72.8427, 19.0178];
const bandra = [72.8402, 19.0596];
const dist = calculateDistanceMeters(dadar, bandra);
console.log(`✅ Distance Test: Dadar to Bandra = ${dist} meters (~4.6km expected)`);
if (dist < 4000 || dist > 5500) throw new Error('Distance calculation out of range');

// Test 2: XGBoost Probability scoring
const prob1 = calculateXGBoostProbability({ distanceKm: 1.2, idleHours: 36, ratingAvg: 4.9, experienceYears: 5 });
const prob2 = calculateXGBoostProbability({ distanceKm: 9.5, idleHours: 1, ratingAvg: 3.2, experienceYears: 1 });
console.log(`✅ XGBoost Scoring Test: Top candidate prob = ${prob1}, Distant/busy candidate prob = ${prob2}`);
if (prob1 <= prob2) throw new Error('XGBoost probability ordering incorrect');

// Test 3: 88/5/4/3 Cooperative Split Math
const testAmounts = [500, 750, 1200, 399, 149];
testAmounts.forEach(amt => {
    const split = calculateCooperativeSplit(amt);
    const sum = split.workerPayout + split.societyFee + split.platformFee + split.welfareFund;
    console.log(`✅ Split Test for ₹${amt}: Worker ₹${split.workerPayout}, Society ₹${split.societyFee}, Tech ₹${split.platformFee}, Welfare ₹${split.welfareFund} => Sum = ₹${sum}`);
    if (sum !== amt) throw new Error(`Split rounding mismatch on ₹${amt}: sum=${sum}`);
});

console.log('\n🎉 ALL CORE BACKEND ENGINE TESTS PASSED!');
process.exit(0);
