const axios = require('axios');

function firstNonEmpty(address, keys) {
  for (const key of keys) {
    const value = address?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function dedupeAgainst(value, ...others) {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  const duplicate = others.some(
    (other) => typeof other === 'string' && other.trim().toLowerCase() === normalized
  );
  return duplicate ? null : value;
}

/**
 * Reverse geocode (lat, lng) using Nominatim (OpenStreetMap).
 * Free, no API key needed. Always returns — never throws.
 * Adds `areaType` ('city' | 'town' | 'village' | null) for portal routing (Change 4).
 */
async function reverseGeocode(lat, lng) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon: lng, format: 'json', addressdetails: 1 },
      headers: { 'User-Agent': 'CivicVoice/1.0 (civic-complaint-aggregator)' },
      timeout: 5000
    });

    const addr = response.data.address || {};

    const ward = firstNonEmpty(addr, [
      'suburb',
      'neighbourhood',
      'quarter',
      'borough',
      'city_district'
    ]);
    const city = firstNonEmpty(addr, [
      'city',
      'town',
      'municipality',
      'city_district',
      'village'
    ]);
    const district = dedupeAgainst(
      firstNonEmpty(addr, ['county', 'state_district', 'district']),
      city
    );
    const locality = dedupeAgainst(
      firstNonEmpty(addr, [
        'neighbourhood',
        'suburb',
        'quarter',
        'hamlet',
        'village',
        'city_district',
        'municipality',
        'town'
      ]),
      ward,
      city,
      district
    );

    let areaType = null;
    if (addr.city || addr.municipality) areaType = 'city';
    else if (addr.town) areaType = 'town';
    else if (addr.village || addr.hamlet) areaType = 'village';

    return {
      ward,
      locality,
      city,
      district,
      state: addr.state || null,
      pincode: addr.postcode || null,
      areaType,
      fullAddress: response.data.display_name || null
    };
  } catch (error) {
    console.error('Geocoding failed:', error.message);
    return {
      ward: null,
      locality: null,
      city: null,
      district: null,
      state: null,
      pincode: null,
      areaType: null,
      fullAddress: null
    };
  }
}

module.exports = { reverseGeocode };
