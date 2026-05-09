const { findPortal } = require('../utils/portalMatcher');

/**
 * GET /api/portals?state=&district=&city=&type=
 */
function getPortal(req, res, next) {
  try {
    const { state, district, city, type } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Query param "type" is required'
      });
    }

    const portal = findPortal(state, district, city, type);

    return res.json({
      success: true,
      portal,
      query: { state, district, city, type }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getPortal };
