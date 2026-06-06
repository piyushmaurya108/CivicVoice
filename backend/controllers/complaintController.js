const crypto = require('crypto');
const Complaint = require('../models/Complaint');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { analyseImage, analyseText } = require('../services/geminiService');
const { reverseGeocode } = require('../services/geocodeService');
const { findNearbySameType, updateClusterCount } = require('../services/clusterService');
const { generatePetition } = require('../services/petitionService');
const { findPortals } = require('../utils/portalMatcher');
const { getRepresentatives } = require('./civicController');
const { getOrganisationsFor } = require('../config/orgLookup');

const MIN_DESC = 20;
const MAX_DESC = 500;

/**
 * POST /api/complaints
 * Pipeline: validate → (optional) upload → analyse (image or text) → geocode →
 *           cluster → portals → petition → save.
 */
async function submitComplaint(req, res, next) {
  let cloudinaryPublicId = null;

  try {
    // 1. Validate location
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

    // 1b. Validate description — now MANDATORY, min 20 chars (Change 2)
    const userDescription = (req.body.description || '').trim().slice(0, MAX_DESC);
    if (userDescription.length < MIN_DESC) {
      return res.status(400).json({
        success: false,
        message: `A description of at least ${MIN_DESC} characters is required.`,
        errors: [{ field: 'description', message: `Please describe the issue in at least ${MIN_DESC} characters.` }]
      });
    }

    // 2. Upload to Cloudinary — only if a photo was provided (Change 2)
    let imageUrl;
    if (req.file) {
      try {
        const cloudResult = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        cloudinaryPublicId = cloudResult.public_id;
        imageUrl = cloudResult.secure_url;
      } catch (err) {
        console.error('Cloudinary upload failed:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Image upload failed. Please verify your Cloudinary credentials and try again.'
        });
      }
    }

    // 3 & 4. Analyse — image+description if a photo exists, else description only (Change 2)
    const aiResult = imageUrl
      ? await analyseImage(imageUrl, userDescription)
      : await analyseText(userDescription);

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

    // 7. Match portals — ranked list (Change 4); top one kept for backward compat
    const portals = findPortals(address.state, address.district, address.city, aiResult.type, address);
    const portal = portals[0];

    // 8. Generate petition — specific, single-citizen, NO counts (Change 5)
    const petitionText = await generatePetition({
      type: aiResult.type,
      severity: aiResult.severity,
      userDescription,
      aiDescription: aiResult.aiDescription,
      address,
      portal
    });

    const clusterId = nearby[0]?.clusterId || crypto.randomBytes(6).toString('hex');

    // 9. Save
    const complaint = await Complaint.create({
      type: aiResult.type,
      severity: aiResult.severity,
      description: userDescription,
      aiDescription: aiResult.aiDescription,
      landmark: aiResult.landmark || undefined,
      aiConfidence: aiResult.confidence,
      imageUrl: imageUrl || undefined,
      imagePublicId: cloudinaryPublicId || undefined,
      location: { type: 'Point', coordinates: [lng, lat] },
      address,
      matchedPortal: {
        name: portal.name,
        url: portal.url,
        officer: portal.officer,
        email: portal.email,
        phone: portal.phone,
        description: portal.description,
        steps: portal.steps,
        isMunicipal: !!portal.isMunicipal,
        isNational: !!portal.isNational
      },
      portalSuggestions: portals,
      clusterId,
      nearbyCount,
      petitionText
    });

    // Sync the cluster count across older complaints (fire and forget)
    updateClusterCount({
      lat, lng, type: aiResult.type, clusterId, count: nearbyCount
    }).catch((err) => console.error('Cluster count update failed:', err.message));

    // Representatives + organisations for the result page (Changes 6 & 7)
    const representatives = getRepresentatives(address);
    const organisations = getOrganisationsFor(aiResult.type, address.state);

    // 10. Respond
    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint,
      nearbyCount,
      portal,
      portals,
      petitionText,
      representatives,
      organisations
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
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.state) filter['address.state'] = req.query.state;
    // status filter removed in Change 1

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

    // Enrich detail view with representatives + organisations (Changes 6 & 7)
    const representatives = getRepresentatives(complaint.address || {});
    const organisations = getOrganisationsFor(complaint.type, complaint.address?.state);

    return res.json({ success: true, complaint, representatives, organisations });
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
