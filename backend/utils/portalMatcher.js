const portals = require('../config/portals.json');

const MC_CITIES = {
  Punjab: ['Ludhiana', 'Jalandhar', 'Amritsar', 'Patiala', 'Mohali', 'Bathinda'],
  Delhi: ['Delhi', 'New Delhi'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Hubli', 'Dharwad'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Prayagraj']
};

// Roads-type complaints that can occur on a National Highway → NHAI is offered as an option.
const HIGHWAY_TYPES = new Set(['broken_road', 'waterlogging']);

const TYPE_LABELS = {
  broken_road: 'broken/damaged road',
  waterlogging: 'waterlogging',
  garbage: 'garbage / sanitation',
  streetlight: 'streetlight',
  sewage: 'sewage',
  water_supply: 'water supply',
  other: 'civic issue'
};

function isMCCity(state, city) {
  return (MC_CITIES[state] || []).some(
    (c) => city && city.toLowerCase().includes(c.toLowerCase())
  );
}

function findDistrictKey(typeConfig, district) {
  return Object.keys(typeConfig.districts || {}).find(
    (d) => district && district.toLowerCase().includes(d.toLowerCase())
  );
}

// Strip internal keys and guarantee a description + steps exist.
function cleanPortal(obj, { tag, fallbackSteps, fallbackDescription } = {}) {
  if (!obj) return null;
  const { districts, mc_portal, ...rest } = obj;
  return {
    name: rest.name,
    url: rest.url,
    officer: rest.officer,
    email: rest.email,
    phone: rest.phone,
    description: rest.description || fallbackDescription || '',
    steps: Array.isArray(rest.steps) && rest.steps.length ? rest.steps : (fallbackSteps || portals._fallback.steps),
    isMunicipal: !!rest.isMunicipal,
    isNational: !!rest.isNational,
    ...(tag ? { tag } : {})
  };
}

// Resolve the department/type-specific portal for a state+type, applying district overrides.
function resolveTypePortal(state, district, city, complaintType) {
  const stateConfig = portals[state];
  if (!stateConfig) return null;
  const typeConfig = stateConfig[complaintType];
  if (!typeConfig) return null;

  const districtKey = findDistrictKey(typeConfig, district);
  if (districtKey) {
    const merged = { ...typeConfig, ...typeConfig.districts[districtKey] };
    return merged;
  }
  return typeConfig;
}

function resolveMCPortal(state, district, city, complaintType) {
  if (!isMCCity(state, city)) return null;
  const stateConfig = portals[state];
  const typeConfig = stateConfig && stateConfig[complaintType];
  if (!typeConfig) return null;
  const districtKey = findDistrictKey(typeConfig, district);
  const dConf = districtKey ? typeConfig.districts[districtKey] : null;
  const mc = dConf && dConf.mc_portal;
  if (!mc) return null;
  const cityName = (city || dConf?.officer || 'your city').replace(/^XEN PWD\s+/, '').replace(/\s+Division$/, '');
  return {
    name: mc.name,
    url: mc.url,
    phone: mc.phone,
    officer: `Commissioner, ${mc.name}`,
    isMunicipal: true,
    description: `Municipal Corporation handling ${TYPE_LABELS[complaintType] || 'civic'} issues inside the city limits — the most direct route for an urban complaint.`,
    steps: [
      `Open the Municipal Corporation portal: ${mc.url}`,
      'Register / log in and choose the relevant civic complaint category',
      'Enter your ward, locality and a clear description of the problem',
      'Attach a photo of the issue if you have one',
      'Paste the petition text and submit; save the complaint/token number'
    ]
  };
}

/**
 * Determine the broad area type for routing.
 * Priority: explicit areaType from geocoder → MC-city heuristic → city/town/village hints.
 */
function resolveAreaType(state, city, address) {
  const explicit = address && address.areaType;
  if (explicit === 'city' || explicit === 'town' || explicit === 'village') return explicit;
  if (isMCCity(state, city)) return 'city';
  if (city) return 'town';
  return 'village';
}

/**
 * Pick a single best portal (backward-compatible with the old findPortal contract).
 */
function findPortal(state, district, city, complaintType, address) {
  const list = findPortals(state, district, city, complaintType, address);
  return list[0];
}

/**
 * Return a RANKED list of relevant portals (Change 4).
 * Most relevant first; CPGRAMS always last.
 */
function findPortals(state, district, city, complaintType, address) {
  const out = [];
  const seen = new Set();
  const push = (p) => {
    if (!p || !p.name) return;
    const key = `${p.name}|${p.url}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(p);
  };

  const stateConfig = portals[state];
  const areaType = resolveAreaType(state, city, address);

  const typePortalRaw = resolveTypePortal(state, district, city, complaintType);
  const mcPortal = resolveMCPortal(state, district, city, complaintType);
  const statePortalRaw = stateConfig && stateConfig._state_portal;
  const isRoadType = HIGHWAY_TYPES.has(complaintType);

  if (!stateConfig) {
    // Unknown/unconfigured state → route by area type using universal offices.
    if (areaType === 'village') {
      push(cleanPortal(portals._bdo, { tag: 'Recommended' }));
      push(cleanPortal(portals._collector, { tag: 'Escalation' }));
    } else {
      // Town/city with no configured department → District Collector is the
      // universal escalation point; municipal office handled locally.
      push(cleanPortal(portals._collector, { tag: 'Recommended' }));
    }
    if (isRoadType) {
      push(cleanPortal(portals._nhai, { tag: 'If on a National Highway' }));
    }
    push(cleanPortal(portals._fallback, { tag: 'National fallback', fallbackDescription: portals._fallback.description }));
    out[out.length - 1].isNational = true;
    return out;
  }

  if (areaType === 'city') {
    // Major city: Municipal Corporation first, then the department portal.
    if (mcPortal) push({ ...mcPortal, tag: 'Recommended' });
    if (typePortalRaw) {
      push(
        cleanPortal(typePortalRaw, {
          tag: mcPortal ? 'Department portal' : 'Recommended',
          fallbackDescription: `Department portal for ${TYPE_LABELS[complaintType]} issues.`
        })
      );
    }
  } else if (areaType === 'town') {
    // Small town: state urban-development / department portal first.
    if (typePortalRaw) {
      push(
        cleanPortal(typePortalRaw, {
          tag: 'Recommended',
          fallbackDescription: `Department portal for ${TYPE_LABELS[complaintType]} issues.`
        })
      );
    }
    if (statePortalRaw) {
      push(cleanPortal(statePortalRaw, { tag: typePortalRaw ? 'State portal' : 'Recommended' }));
    }
  } else {
    // Village / rural: BDO then District Collector, then department/state if available.
    push(cleanPortal(portals._bdo, { tag: 'Recommended' }));
    push(cleanPortal(portals._collector, { tag: 'Escalation' }));
    if (typePortalRaw) {
      push(
        cleanPortal(typePortalRaw, {
          tag: 'Department portal',
          fallbackDescription: `Department portal for ${TYPE_LABELS[complaintType]} issues.`
        })
      );
    }
  }

  // Always offer the state portal as a general option (if not already added).
  if (statePortalRaw) push(cleanPortal(statePortalRaw, { tag: 'State portal' }));

  // National Highway option for road-type complaints, regardless of state.
  if (isRoadType) push(cleanPortal(portals._nhai, { tag: 'If on a National Highway' }));

  // CPGRAMS national fallback — always last.
  push(cleanPortal(portals._fallback, { tag: 'National fallback', fallbackDescription: portals._fallback.description }));
  out[out.length - 1].isNational = true;

  return out;
}

module.exports = { findPortal, findPortals };
