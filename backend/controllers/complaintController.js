const crypto = require('crypto');
const Complaint = require('../models/Complaint');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { analyseImage } = require('../services/geminiService');
const { reverseGeocode } = require('../services/geocodeService');
const { findNearbySameType, updateClusterCount } = require('../services/clusterService');
const { generatePetition } = require('../services/petitionService');
const { findPortal } = require('../utils/portalMatcher');

/**
 * POST /api/complaints
 * Pipeline: upload → vision → geocode → cluster → portal → petition → save.
 */
async function submitComplaint(req, res, next) {
  let cloudinaryPublicId = null;

  try {
    // 1. Validate
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required (field name: "image")'
      });
    }

    const lat = parseFloat(req.body.latitude);
    const lng = parseFloat(req.body.longitude);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < -90 || lat > 90 ||
      lng < -180 || lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude are required'
      });
    }

    const userDescription = (req.body.description || '').trim().slice(0, 500);
    const reporterSession =
      req.body.session ||
      req.headers['x-session-id'] ||
      crypto.randomBytes(8).toString('hex');

    // 2. Upload to Cloudinary
    let cloudResult;
    try {
      cloudResult = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      cloudinaryPublicId = cloudResult.public_id;
    } catch (err) {
      console.error('Cloudinary upload failed:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Image upload failed. Please verify your Cloudinary credentials and try again.'
      });
    }

    const imageUrl = cloudResult.secure_url;

    // 3 & 4. Gemini Vision (with built-in fallback)
    const aiResult = await analyseImage(imageUrl, userDescription);

    // 5. Reverse geocode (with built-in fallback)
    const address = await reverseGeocode(lat, lng);

    // 6. Find nearby same-type complaints
    let nearby = [];
    try {
      nearby = await findNearbySameType({ lat, lng, type: aiResult.type, radius: 500 });
    } catch (err) {
      console.error('Nearby cluster query failed:', err.message);
    }
    const nearbyCount = nearby.length + 1;

    // 7. Match portal
    const portal = findPortal(address.state, address.district, address.city, aiResult.type);

    // 8. Generate petition (with built-in fallback)
    const petitionText = await generatePetition({
      type: aiResult.type,
      severity: aiResult.severity,
      aiDescription: aiResult.aiDescription,
      address,
      nearbyCount,
      portal
    });

    const clusterId = nearby[0]?.clusterId || crypto.randomBytes(6).toString('hex');

    // 9. Save
    const complaint = await Complaint.create({
      type: aiResult.type,
      severity: aiResult.severity,
      description: userDescription || undefined,
      aiDescription: aiResult.aiDescription,
      landmark: aiResult.landmark || undefined,
      aiConfidence: aiResult.confidence,
      imageUrl,
      imagePublicId: cloudinaryPublicId,
      location: { type: 'Point', coordinates: [lng, lat] },
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
      clusterId,
      nearbyCount,
      petitionText,
      reporterSession
    });

    // Sync the cluster count across older complaints (fire and forget)
    updateClusterCount({
      lat, lng, type: aiResult.type, clusterId, count: nearbyCount
    }).catch((err) => console.error('Cluster count update failed:', err.message));

    // 10. Respond
    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint,
      nearbyCount,
      portal,
      petitionText
    });
  } catch (error) {
    if (cloudinaryPublicId) {
      deleteFromCloudinary(cloudinaryPublicId).catch(() => {});
    }
    return next(error);
  }
}

/**
 * GET /api/complaints
 */
async function getComplaints(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.state) filter['address.state'] = req.query.state;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Complaint.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      complaints,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      limit
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/complaints/stats
 */
async function getStats(req, res, next) {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, recentCount, byTypeAgg, bySeverityAgg, statesAgg] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Complaint.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Complaint.aggregate([
        { $match: { 'address.state': { $ne: null } } },
        { $group: { _id: '$address.state' } }
      ])
    ]);

    const byType = {};
    byTypeAgg.forEach((r) => {
      byType[r._id || 'other'] = r.count;
    });

    const bySeverity = {};
    bySeverityAgg.forEach((r) => {
      bySeverity[r._id || 'medium'] = r.count;
    });

    return res.json({
      success: true,
      total,
      recentCount,
      byType,
      bySeverity,
      statesCovered: statesAgg.length
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/complaints/nearby?lat=&lng=&radius=&type=
 */
async function getNearbyComplaints(req, res, next) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius, 10) || 500;

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid lat and lng query params required'
      });
    }

    const query = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius
        }
      }
    };
    if (req.query.type) query.type = req.query.type;

    const complaints = await Complaint.find(query).limit(50).lean();

    return res.json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/complaints/:id
 */
async function getComplaintById(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id).lean();
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    return res.json({ success: true, complaint });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  submitComplaint,
  getComplaints,
  getStats,
  getNearbyComplaints,
  getComplaintById
};
