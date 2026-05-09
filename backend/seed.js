/**
 * Seed script: inserts 25 realistic civic complaints into MongoDB.
 *
 * Usage:  node seed.js
 * Drops existing complaints first, then inserts the seed batch.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const { findPortal } = require('./utils/portalMatcher');

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env');
  process.exit(1);
}

const NOW = Date.now();
const daysAgo = (n) => new Date(NOW - n * 24 * 60 * 60 * 1000);

// Type → human-readable phrase used in the petition body
const TYPE_LABELS = {
  broken_road: 'broken/damaged road',
  waterlogging: 'waterlogging and flooding',
  garbage: 'garbage accumulation',
  streetlight: 'non-functional streetlight',
  sewage: 'sewage overflow',
  water_supply: 'water supply disruption',
  other: 'civic infrastructure issue'
};

// Build a templated petition for seed data (no AI calls needed)
function makePetition({ type, severity, address, nearbyCount, officer }) {
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const fullLoc = [address.locality, address.city, address.district, address.state]
    .filter(Boolean)
    .join(', ');

  return `Subject: Urgent Grievance Regarding ${TYPE_LABELS[type]} at ${address.locality || address.city}

Date: ${today}

To,
${officer}

Respected Sir/Madam,

We, the undersigned residents of ${fullLoc}, wish to bring to your urgent attention a serious ${TYPE_LABELS[type]} affecting our community. The issue has persisted for several days and is causing major inconvenience to residents, daily commuters, school children, and the elderly.

This grievance has now been reported by ${nearbyCount} concerned citizens within a 500-metre radius. The severity is assessed as ${severity}, and continued inaction is creating a public safety risk. We have documented the problem with photographs which are attached to this petition.

We respectfully demand that your office take immediate action within the next 7 working days — including a site inspection, repair or remedial work, and a written update to the citizens. As taxpayers, we have a fundamental right to functional civic infrastructure.

We trust this matter will receive the urgency it deserves.

Yours faithfully,
Concerned Citizens of ${address.locality || address.city}, ${address.city || address.state} (${nearbyCount} residents)`;
}

// Real-ish coordinates near city centres
const SEEDS = [
  // ── Ludhiana, Punjab ─────────────────────────────────────────────
  { type: 'broken_road', severity: 'high', lng: 75.8573, lat: 30.9010,
    locality: 'Civil Lines', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', pincode: '141001',
    daysOld: 2 },
  { type: 'broken_road', severity: 'critical', lng: 75.8580, lat: 30.9015,
    locality: 'Civil Lines', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', pincode: '141001',
    daysOld: 1 },
  { type: 'broken_road', severity: 'medium', lng: 75.8500, lat: 30.9100,
    locality: 'Model Town', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', pincode: '141002',
    daysOld: 5 },
  { type: 'waterlogging', severity: 'high', lng: 75.8520, lat: 30.9050,
    locality: 'Sarabha Nagar', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', pincode: '141001',
    daysOld: 3 },
  { type: 'waterlogging', severity: 'critical', lng: 75.8525, lat: 30.9055,
    locality: 'Sarabha Nagar', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', pincode: '141001',
    daysOld: 2 },
  { type: 'garbage', severity: 'medium', lng: 75.8430, lat: 30.8965,
    locality: 'BRS Nagar', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', pincode: '141012',
    daysOld: 4 },
  { type: 'garbage', severity: 'high', lng: 75.8435, lat: 30.8970,
    locality: 'BRS Nagar', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', pincode: '141012',
    daysOld: 6 },
  { type: 'streetlight', severity: 'low', lng: 75.8620, lat: 30.9080,
    locality: 'Rajguru Nagar', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', pincode: '141012',
    daysOld: 8 },
  { type: 'sewage', severity: 'critical', lng: 75.8470, lat: 30.9040,
    locality: 'Field Ganj', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', pincode: '141008',
    daysOld: 1 },
  { type: 'water_supply', severity: 'high', lng: 75.8560, lat: 30.9120,
    locality: 'Punjabi Bagh', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', pincode: '141013',
    daysOld: 3 },

  // ── Jalandhar, Punjab ────────────────────────────────────────────
  { type: 'broken_road', severity: 'high', lng: 75.5762, lat: 31.3260,
    locality: 'Model Town', city: 'Jalandhar', district: 'Jalandhar', state: 'Punjab', pincode: '144003',
    daysOld: 4 },
  { type: 'waterlogging', severity: 'medium', lng: 75.5800, lat: 31.3300,
    locality: 'Adarsh Nagar', city: 'Jalandhar', district: 'Jalandhar', state: 'Punjab', pincode: '144008',
    daysOld: 7 },
  { type: 'garbage', severity: 'high', lng: 75.5750, lat: 31.3220,
    locality: 'Bhargav Camp', city: 'Jalandhar', district: 'Jalandhar', state: 'Punjab', pincode: '144001',
    daysOld: 5 },
  { type: 'streetlight', severity: 'medium', lng: 75.5820, lat: 31.3280,
    locality: 'Lajpat Nagar', city: 'Jalandhar', district: 'Jalandhar', state: 'Punjab', pincode: '144001',
    daysOld: 9 },
  { type: 'water_supply', severity: 'critical', lng: 75.5780, lat: 31.3240,
    locality: 'Urban Estate', city: 'Jalandhar', district: 'Jalandhar', state: 'Punjab', pincode: '144022',
    daysOld: 2 },

  // ── Amritsar, Punjab ─────────────────────────────────────────────
  { type: 'broken_road', severity: 'medium', lng: 74.8723, lat: 31.6340,
    locality: 'Hall Bazaar', city: 'Amritsar', district: 'Amritsar', state: 'Punjab', pincode: '143001',
    daysOld: 6 },
  { type: 'sewage', severity: 'high', lng: 74.8740, lat: 31.6360,
    locality: 'Lawrence Road', city: 'Amritsar', district: 'Amritsar', state: 'Punjab', pincode: '143001',
    daysOld: 3 },
  { type: 'waterlogging', severity: 'critical', lng: 74.8700, lat: 31.6320,
    locality: 'Katra Sher Singh', city: 'Amritsar', district: 'Amritsar', state: 'Punjab', pincode: '143006',
    daysOld: 1 },
  { type: 'garbage', severity: 'low', lng: 74.8780, lat: 31.6380,
    locality: 'Ranjit Avenue', city: 'Amritsar', district: 'Amritsar', state: 'Punjab', pincode: '143001',
    daysOld: 11 },

  // ── Delhi ─────────────────────────────────────────────────────────
  { type: 'broken_road', severity: 'critical', lng: 77.2090, lat: 28.6139,
    locality: 'Connaught Place', city: 'New Delhi', district: 'New Delhi', state: 'Delhi', pincode: '110001',
    daysOld: 2 },
  { type: 'water_supply', severity: 'high', lng: 77.2350, lat: 28.6280,
    locality: 'Daryaganj', city: 'Delhi', district: 'Central Delhi', state: 'Delhi', pincode: '110002',
    daysOld: 4 },
  { type: 'garbage', severity: 'high', lng: 77.1910, lat: 28.5560,
    locality: 'Saket', city: 'Delhi', district: 'South Delhi', state: 'Delhi', pincode: '110017',
    daysOld: 5 },
  { type: 'streetlight', severity: 'medium', lng: 77.2700, lat: 28.6400,
    locality: 'Shahdara', city: 'Delhi', district: 'East Delhi', state: 'Delhi', pincode: '110032',
    daysOld: 7 },
  { type: 'sewage', severity: 'critical', lng: 77.1025, lat: 28.7041,
    locality: 'Rohini', city: 'Delhi', district: 'North West Delhi', state: 'Delhi', pincode: '110085',
    daysOld: 1 },
  { type: 'waterlogging', severity: 'high', lng: 77.2300, lat: 28.6500,
    locality: 'Civil Lines', city: 'Delhi', district: 'North Delhi', state: 'Delhi', pincode: '110054',
    daysOld: 3 }
];

async function run() {
  console.log('🌱 Seeding CivicVoice database...\n');

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ Connected to MongoDB');

  const deleted = await Complaint.deleteMany({});
  console.log(`🗑️  Cleared ${deleted.deletedCount} existing complaints`);

  // Group seeds to assign realistic clusters & nearbyCount
  const docs = SEEDS.map((s, i) => {
    const address = {
      locality: s.locality,
      city: s.city,
      district: s.district,
      state: s.state,
      pincode: s.pincode,
      ward: s.locality,
      fullAddress: `${s.locality}, ${s.city}, ${s.district}, ${s.state} ${s.pincode}, India`
    };

    // Count siblings within ~500m of the same type
    const nearbyCount = SEEDS.filter(
      (x) =>
        x.type === s.type &&
        Math.abs(x.lat - s.lat) < 0.01 &&
        Math.abs(x.lng - s.lng) < 0.01
    ).length;

    const portal = findPortal(s.state, s.district, s.city, s.type);

    const petitionText = makePetition({
      type: s.type,
      severity: s.severity,
      address,
      nearbyCount,
      officer: portal.officer || 'The Concerned Authority'
    });

    return {
      type: s.type,
      severity: s.severity,
      description: undefined,
      aiDescription: `Seeded ${TYPE_LABELS[s.type]} complaint at ${s.locality}, ${s.city}.`,
      landmark: null,
      aiConfidence: 0.85,
      imageUrl: `https://picsum.photos/800/600?random=${i + 1}`,
      imagePublicId: null,
      location: { type: 'Point', coordinates: [s.lng, s.lat] },
      address,
      matchedPortal: {
        name: portal.name,
        url: portal.url,
        officer: portal.officer,
        email: portal.email,
        phone: portal.phone,
        steps: portal.steps,
        isMunicipal: !!portal.isMunicipal,
        isNational: !!portal.isNational
      },
      clusterId: `seed-${s.type}-${s.city}`.toLowerCase().replace(/\s+/g, '-'),
      nearbyCount,
      petitionText,
      status: 'pending',
      reporterSession: `seed-session-${i + 1}`,
      createdAt: daysAgo(s.daysOld),
      updatedAt: daysAgo(s.daysOld)
    };
  });

  const inserted = await Complaint.insertMany(docs);
  console.log(`✅ Inserted ${inserted.length} complaints`);

  // Quick summary
  const byType = {};
  inserted.forEach((c) => {
    byType[c.type] = (byType[c.type] || 0) + 1;
  });
  console.log('\n📊 Breakdown by type:');
  Object.entries(byType).forEach(([t, n]) => console.log(`   ${t.padEnd(14)} ${n}`));

  await mongoose.disconnect();
  console.log('\n👋 Done. Database seeded successfully.');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
