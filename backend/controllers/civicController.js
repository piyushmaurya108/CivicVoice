const reps = require('../config/representatives.json');
const { getOrganisationsFor } = require('../config/orgLookup');

/**
 * Build a directory-fallback set of representative cards for a location (Change 6).
 * Used when we don't have specific people for the exact constituency — we never
 * fabricate names, we point the citizen at the official directories instead.
 */
function fallbackReps(address) {
  const state = address?.state || null;
  const stateDirs = (reps._directories.states && reps._directories.states[state]) || {};
  const place = [address?.city, address?.district, state].filter(Boolean).join(', ') || 'your area';

  const mk = (role, dir, constituency) => ({
    role,
    name: dir ? `Find your ${role} — ${dir.name}` : `Find your ${role}`,
    party: null,
    constituency,
    email: null,
    phone: null,
    twitter: null,
    facebook: null,
    instagram: null,
    directoryUrl: dir ? dir.url : null,
    verified: false,
    note: `We don't have a confirmed ${role} on file for ${place}. Use the official directory to find the current ${role} for your constituency.`
  });

  return {
    mp: mk('MP', reps._directories.mp, `Lok Sabha constituency covering ${place}`),
    mla: mk('MLA', stateDirs.mla, `Assembly constituency in ${place}`),
    mayor: mk('Mayor / Local Body Head', stateDirs.mayor, `Local body in ${place}`)
  };
}

/**
 * Resolve representatives for a complaint location.
 * Tries an exact "State|City" or "State|District" match, else falls back to directories.
 */
function getRepresentatives(address) {
  const state = address?.state || null;
  const city = address?.city || null;
  const district = address?.district || null;

  let entry = null;
  if (state) {
    const keys = [city && `${state}|${city}`, district && `${state}|${district}`].filter(Boolean);
    for (const k of keys) {
      if (reps.constituencies[k]) {
        entry = reps.constituencies[k];
        break;
      }
    }
  }

  const fb = fallbackReps(address);

  const withRole = (obj, role, fbObj) => {
    if (!obj) return fbObj;
    return { role, directoryUrl: fbObj.directoryUrl, ...obj };
  };

  const result = entry
    ? {
        mp: withRole(entry.mp, 'MP', fb.mp),
        mla: withRole(entry.mla, 'MLA', fb.mla),
        mayor: withRole(entry.mayor, 'Mayor / Local Body Head', fb.mayor)
      }
    : fb;

  return {
    cards: result,
    meta: reps._meta
  };
}

// ── Route handlers ──────────────────────────────────────────────

/**
 * GET /api/representatives?state=&city=&district=
 */
function getRepresentativesRoute(req, res, next) {
  try {
    const { state, city, district } = req.query;
    const data = getRepresentatives({ state, city, district });
    return res.json({ success: true, ...data, query: { state, city, district } });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/organisations?type=&state=
 */
function getOrganisationsRoute(req, res, next) {
  try {
    const { type, state } = req.query;
    const data = getOrganisationsFor(type || 'other', state);
    return res.json({ success: true, ...data, query: { type, state } });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getRepresentatives,
  getRepresentativesRoute,
  getOrganisationsRoute
};
