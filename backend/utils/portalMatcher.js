const portals = require('../config/portals.json');

const MC_CITIES = {
  Punjab: ['Ludhiana', 'Jalandhar', 'Amritsar', 'Patiala', 'Mohali', 'Bathinda'],
  Delhi: ['Delhi', 'New Delhi'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Hubli', 'Dharwad'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Prayagraj']
};

/**
 * Pick the most appropriate government portal for a complaint.
 * Priority: district MC → district PWD → state type-specific → state portal → CPGRAMS.
 */
function findPortal(state, district, city, complaintType) {
  const stateConfig = portals[state];

  if (!stateConfig) {
    return { ...portals._fallback, isNational: true };
  }

  const typeConfig = stateConfig[complaintType];

  if (!typeConfig) {
    return {
      ...stateConfig._state_portal,
      steps: portals._fallback.steps
    };
  }

  const isMCCity = (MC_CITIES[state] || []).some(
    (c) => city && city.toLowerCase().includes(c.toLowerCase())
  );

  const districtKey = Object.keys(typeConfig.districts || {}).find(
    (d) => district && district.toLowerCase().includes(d.toLowerCase())
  );

  if (districtKey) {
    const districtConfig = typeConfig.districts[districtKey];
    const merged = { ...typeConfig, ...districtConfig };

    if (isMCCity && districtConfig.mc_portal) {
      const { districts, mc_portal, ...rest } = merged;
      return {
        ...rest,
        name: mc_portal.name,
        url: mc_portal.url,
        isMunicipal: true
      };
    }

    const { districts, mc_portal, ...cleanResult } = merged;
    return cleanResult;
  }

  const { districts, ...cleanTypeConfig } = typeConfig;
  return cleanTypeConfig;
}

module.exports = { findPortal };
