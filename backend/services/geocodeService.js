const axios = require('axios');

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

    let areaType = null;
    if (addr.city) areaType = 'city';
    else if (addr.town) areaType = 'town';
    else if (addr.village || addr.hamlet) areaType = 'village';

    return {
      ward: addr.suburb || addr.neighbourhood || addr.quarter || null,
      locality: addr.suburb || addr.village || addr.town || addr.neighbourhood || null,
      city: addr.city || addr.town || addr.village || addr.county || null,
      district: addr.county || addr.state_district || null,
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
