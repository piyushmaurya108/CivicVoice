import { useState } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';
import {
  COUNTRY,
  STATE_NAMES,
  getStateMeta,
  getDistricts
} from '../data/indiaStates.js';
import { forwardGeocode } from '../utils/geocode.js';

/**
 * 4-level cascading address selector (Change 3):
 *   Country (fixed: India) → State → District → Locality (free text)
 *
 * Props:
 *   onZoom({ lat, lng }, zoom)  — fly the map in parallel (no pin dropped)
 *   onPick({ lat, lng })        — drop a pin (same as a manual map click)
 */
export default function AddressSearch({ onZoom, onPick }) {
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [locality, setLocality] = useState('');
  const [locating, setLocating] = useState(false);
  const [status, setStatus] = useState(null); // { kind: 'ok'|'warn', text }

  const districts = state ? getDistricts(state) : [];

  const handleStateChange = async (value) => {
    setState(value);
    setDistrict('');
    setStatus(null);
    if (!value) return;
    const meta = getStateMeta(value);
    if (meta && onZoom) onZoom({ lat: meta.lat, lng: meta.lng }, meta.zoom || 7);
  };

  const handleDistrictChange = async (value) => {
    setDistrict(value);
    setStatus(null);
    if (!value) return;
    // Strip any "(Alt name)" suffix for cleaner geocoding
    const clean = value.replace(/\s*\(.*?\)\s*/g, '').trim();
    const coords = await forwardGeocode(`${clean}, ${state}, ${COUNTRY}`);
    if (coords && onZoom) {
      onZoom(coords, 11);
    } else {
      const meta = getStateMeta(state);
      if (meta && onZoom) onZoom({ lat: meta.lat, lng: meta.lng }, (meta.zoom || 7) + 1);
    }
  };

  const handleConfirmLocality = async () => {
    if (!state) {
      setStatus({ kind: 'warn', text: 'Please select a state first.' });
      return;
    }
    setLocating(true);
    setStatus(null);
    const districtClean = district.replace(/\s*\(.*?\)\s*/g, '').trim();
    const parts = [locality.trim(), districtClean, state, COUNTRY].filter(Boolean);
    const coords = await forwardGeocode(parts.join(', '));

    if (coords) {
      onPick && onPick(coords); // drops a pin exactly like a manual click
      setStatus({
        kind: 'ok',
        text: `Pin dropped at ${[locality.trim(), districtClean, state].filter(Boolean).join(', ')}.`
      });
    } else {
      // Fall back to district / state centre so the user still gets a usable pin
      const fallback =
        (districtClean &&
          (await forwardGeocode(`${districtClean}, ${state}, ${COUNTRY}`))) ||
        (() => {
          const meta = getStateMeta(state);
          return meta ? { lat: meta.lat, lng: meta.lng } : null;
        })();
      if (fallback) {
        onPick && onPick(fallback);
        setStatus({
          kind: 'warn',
          text: 'Could not find that exact locality — dropped a pin at the nearest district/state centre. Drag-click the map to fine-tune.'
        });
      } else {
        setStatus({ kind: 'warn', text: 'Could not locate that address. Try clicking the map instead.' });
      }
    }
    setLocating(false);
  };

  return (
    <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Country (fixed) */}
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">Country</span>
          <select
            value={COUNTRY}
            disabled
            className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-2 py-2 text-sm text-gray-600"
          >
            <option>{COUNTRY}</option>
          </select>
        </label>

        {/* State */}
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">State / UT</span>
          <select
            value={state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Select a state…</option>
            {STATE_NAMES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {/* District (only after a state is chosen) */}
        {state && (
          <label className="text-sm">
            <span className="mb-1 block font-medium text-gray-700">District</span>
            <select
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Select a district…</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Locality (free text) */}
        {state && (
          <label className="text-sm">
            <span className="mb-1 block font-medium text-gray-700">
              Locality / area <span className="font-normal text-gray-400">(optional)</span>
            </span>
            <input
              type="text"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirmLocality();
                }
              }}
              placeholder="e.g. Civil Lines, Model Town…"
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>
        )}
      </div>

      {state && (
        <button
          type="button"
          onClick={handleConfirmLocality}
          disabled={locating}
          className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locating ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <Search size={16} aria-hidden />
          )}
          {locating ? 'Locating…' : 'Set location & drop pin'}
        </button>
      )}

      {status && (
        <p
          className={`flex items-start gap-1.5 text-xs ${
            status.kind === 'ok' ? 'text-green-700' : 'text-amber-700'
          }`}
        >
          <MapPin size={13} className="mt-0.5 flex-shrink-0" aria-hidden />
          <span>{status.text}</span>
        </p>
      )}
    </div>
  );
}
