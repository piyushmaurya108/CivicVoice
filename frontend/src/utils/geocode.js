// Lightweight forward geocoding via Nominatim (OpenStreetMap), no API key.
// Used by the address-search picker to turn a state/district/locality into
// map coordinates. Always resolves (returns null on failure) — never throws.

const ENDPOINT = 'https://nominatim.openstreetmap.org/search';

export async function forwardGeocode(query) {
  if (!query || !query.trim()) return null;
  try {
    const url = `${ENDPOINT}?q=${encodeURIComponent(
      query.trim()
    )}&format=json&limit=1&countrycodes=in&addressdetails=0`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}
