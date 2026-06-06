const { findPortal, findPortals } = require('../utils/portalMatcher');

/**
 * GET /api/portals?state=&district=&city=&type=
 * Returns the ranked list of portals (Change 4) plus the top one (backward compat).
 */
function getPortal(req, res, next) {
  try {
    const { state, district, city, type, areaType } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Query param "type" is required'
      });
    }

    const address = { state, district, city, areaType };
    const portals = findPortals(state, district, city, type, address);
    const portal = findPortal(state, district, city, type, address);

    return res.json({
      success: true,
      portal,
      portals,
      query: { state, district, city, type, areaType }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getPortal };
