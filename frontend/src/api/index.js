import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: false
});

/**
 * Normalise any axios error into a user-friendly string.
 */
export function describeError(err) {
  if (!err) return 'Unknown error';

  if (err.code === 'ECONNABORTED') {
    return 'Request timed out. The server is taking too long — try again.';
  }
  if (err.message === 'Network Error' || !err.response) {
    return 'Server unavailable. Please check your connection and try again.';
  }

  const status = err.response.status;
  const data = err.response.data || {};

  if (status >= 500) {
    return data.message || 'Something went wrong on our end. Please try again shortly.';
  }
  if (status === 404) {
    return data.message || 'Not found.';
  }
  if (status >= 400) {
    if (Array.isArray(data.errors) && data.errors.length) {
      return data.errors.map((e) => e.message || e).join(', ');
    }
    return data.message || 'Invalid request.';
  }
  return 'Unexpected error.';
}

// ────────────────────────── Complaints ──────────────────────────

export async function submitComplaint({ image, latitude, longitude, description, onUploadProgress }) {
  const formData = new FormData();
  if (image) formData.append('image', image); // photo is now optional (Change 2)
  formData.append('latitude', String(latitude));
  formData.append('longitude', String(longitude));
  formData.append('description', description || ''); // description is mandatory

  const { data } = await api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
  return data;
}

export async function fetchComplaints(params = {}) {
  const { data } = await api.get('/complaints', { params });
  return data;
}

export async function fetchComplaintById(id) {
  const { data } = await api.get(`/complaints/${id}`);
  return data;
}

export async function fetchNearbyComplaints({ lat, lng, radius = 500, type } = {}) {
  const { data } = await api.get('/complaints/nearby', {
    params: { lat, lng, radius, type }
  });
  return data;
}

export async function fetchStats() {
  const { data } = await api.get('/complaints/stats');
  return data;
}

// ────────────────────────── Portals ─────────────────────────────

export async function fetchPortal({ state, district, city, type }) {
  const { data } = await api.get('/portals', {
    params: { state, district, city, type }
  });
  return data;
}

// ──────────────────── Representatives & Organisations ────────────

export async function fetchRepresentatives({ state, city, district } = {}) {
  const { data } = await api.get('/representatives', {
    params: { state, city, district }
  });
  return data;
}

export async function fetchOrganisations({ type, state } = {}) {
  const { data } = await api.get('/organisations', { params: { type, state } });
  return data;
}

export default api;
