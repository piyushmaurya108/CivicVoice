const Complaint = require('../models/Complaint');

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Find same-type complaints within `radius` metres of [lng, lat] in the last 30 days.
 */
async function findNearbySameType({ lat, lng, type, radius = 500, excludeId = null }) {
  const query = {
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radius
      }
    },
    type,
    createdAt: { $gte: new Date(Date.now() - THIRTY_DAYS_MS) }
  };

  if (excludeId) query._id = { $ne: excludeId };

  return Complaint.find(query).limit(20).lean();
}

/**
 * Sync the nearbyCount on every complaint that shares the cluster.
 */
async function updateClusterCount({ lat, lng, type, clusterId, count }) {
  await Complaint.updateMany(
    {
      type,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 500
        }
      },
      createdAt: { $gte: new Date(Date.now() - THIRTY_DAYS_MS) }
    },
    { $set: { nearbyCount: count, clusterId } }
  );
}

module.exports = { findNearbySameType, updateClusterCount };
