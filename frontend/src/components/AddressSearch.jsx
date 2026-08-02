import { useState } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';
import {
  COUNTRY,
  STATE_NAMES,
  getStateMeta,
  getDistricts
} from '../data/indiaStates.js';
import { forwardGeocode } from '../utils/geocode.js';

export default function AddressSearch({ onZoom, onPick }) {
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [locality, setLocality] = useState('');
  const [locating, setLocating] = useState(false);
  const [status, setStatus] = useState(null);

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
      onPick && onPick(coords);
      setStatus({
        kind: 'ok',
        text: `Pin dropped at ${[locality.trim(), districtClean, state].filter(Boolean).join(', ')}.`
      });
    } else {
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
          text: 'Could not find that exact locality. A nearby district or state center was pinned instead.'
        });
      } else {
        setStatus({ kind: 'warn', text: 'Could not locate that address. Try clicking the map instead.' });
      }
    }
    setLocating(false);
  };

  return (
    <div className="rounded-[24px] border border-line bg-surfaceAlt p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-2 block font-semibold text-ink">Country</span>
          <select value={COUNTRY} disabled className="field-input cursor-not-allowed bg-white/70 text-soft">
            <option>{COUNTRY}</option>
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-2 block font-semibold text-ink">State / UT</span>
          <select value={state} onChange={(e) => handleStateChange(e.target.value)} className="field-input">
            <option value="">Select a state...</option>
            {STATE_NAMES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {state && (
          <label className="text-sm">
            <span className="mb-2 block font-semibold text-ink">District</span>
            <select value={district} onChange={(e) => handleDistrictChange(e.target.value)} className="field-input">
              <option value="">Select a district...</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        )}

        {state && (
          <label className="text-sm">
            <span className="mb-2 block font-semibold text-ink">
              Locality / area <span className="font-medium text-mist">(optional)</span>
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
              placeholder="e.g. Civil Lines, Model Town..."
              className="field-input"
            />
          </label>
        )}
      </div>

      {state && (
        <button type="button" onClick={handleConfirmLocality} disabled={locating} className="primary-button mt-5">
          {locating ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {locating ? 'Locating...' : 'Set location & drop pin'}
        </button>
      )}

      {status && (
        <p className={`mt-4 flex items-start gap-2 text-sm ${status.kind === 'ok' ? 'text-green-700' : 'text-amber-700'}`}>
          <MapPin size={15} className="mt-0.5 flex-shrink-0" />
          <span>{status.text}</span>
        </p>
      )}
    </div>
  );
}
