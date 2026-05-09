import { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  TYPE_LABELS,
  SEVERITY_MARKER_HEX,
  formatRelative,
  shortAddress
} from '../utils/formatters.js';
import useGeolocation from '../hooks/useGeolocation.js';

// Fix Leaflet's default marker icon paths (broken by Vite's bundler)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const INDIA_CENTER = [20.5937, 78.9629];
const INDIA_ZOOM = 5;

// Colour-coded SVG marker for the feed view
function severityIcon(severity) {
  const colour = SEVERITY_MARKER_HEX[severity] || '#2563eb';
  const html = `
    <div style="position:relative;width:28px;height:38px;">
      <svg viewBox="0 0 28 38" width="28" height="38" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 14 24 14 24s14-14.5 14-24C28 6.27 21.73 0 14 0z"
          fill="${colour}" stroke="#fff" stroke-width="2"/>
        <circle cx="14" cy="14" r="5" fill="#fff"/>
      </svg>
    </div>`;
  return L.divIcon({
    html,
    className: 'civic-marker',
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -34]
  });
}

// Inner component: handles map clicks for picker mode
function PickerHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

// Inner component: imperatively flies the map to a target lat/lng
function FlyTo({ target, zoom = 15 }) {
  const map = useMap();
  useEffect(() => {
    if (target && Number.isFinite(target.lat) && Number.isFinite(target.lng)) {
      map.flyTo([target.lat, target.lng], zoom, { duration: 0.8 });
    }
  }, [target, zoom, map]);
  return null;
}

/**
 * ComplaintMap
 *
 * Picker mode (default): user clicks the map or hits "Use my GPS" to choose a coordinate.
 *   props: pickedLocation, onLocationPick, height
 *
 * Feed mode: pass `complaints` to render colour-coded markers; clicking opens a popup.
 *   props: complaints, height, onMarkerClick (optional)
 */
export default function ComplaintMap({
  // picker mode
  pickedLocation = null,
  onLocationPick,
  // feed/detail mode
  complaints = null,
  // common
  height = '400px',
  initialCenter = INDIA_CENTER,
  initialZoom = INDIA_ZOOM
}) {
  const isPicker = typeof onLocationPick === 'function';
  const { getLocation, loading: gpsLoading } = useGeolocation();
  const mapRef = useRef(null);

  const handleGPS = async () => {
    try {
      const coords = await getLocation();
      if (onLocationPick) onLocationPick({ lat: coords.lat, lng: coords.lng });
    } catch {
      /* error already surfaced via the hook */
    }
  };

  return (
    <div className="space-y-2">
      {isPicker && (
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
            <MapPin size={16} aria-hidden />
            <span>Click map to drop a pin</span>
          </div>
          <button
            type="button"
            onClick={handleGPS}
            disabled={gpsLoading}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {gpsLoading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <LocateFixed size={16} aria-hidden />
            )}
            {gpsLoading ? 'Locating…' : 'Use my GPS location'}
          </button>
        </div>
      )}

      <div
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        style={{ height }}
      >
        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* PICKER MODE */}
          {isPicker && <PickerHandler onPick={onLocationPick} />}
          {isPicker && pickedLocation && (
            <>
              <FlyTo target={pickedLocation} zoom={15} />
              <Marker position={[pickedLocation.lat, pickedLocation.lng]}>
                <Popup>
                  <strong>Selected location</strong>
                  <br />
                  Lat {pickedLocation.lat.toFixed(5)}, Lng{' '}
                  {pickedLocation.lng.toFixed(5)}
                </Popup>
              </Marker>
            </>
          )}

          {/* FEED MODE */}
          {!isPicker &&
            Array.isArray(complaints) &&
            complaints.map((c) => {
              const coords = c.location?.coordinates;
              if (!Array.isArray(coords) || coords.length !== 2) return null;
              const [lng, lat] = coords;
              return (
                <Marker
                  key={c._id}
                  position={[lat, lng]}
                  icon={severityIcon(c.severity)}
                >
                  <Popup>
                    <div className="space-y-1 text-xs">
                      <div className="font-semibold text-sm">
                        {TYPE_LABELS[c.type] || c.type}{' '}
                        <span className="font-normal text-gray-500 capitalize">
                          · {c.severity}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        {shortAddress(c.address) || 'Location pending'}
                      </div>
                      <div className="text-gray-500">{formatRelative(c.createdAt)}</div>
                      <Link
                        to={`/complaints/${c._id}`}
                        className="mt-1 inline-block font-medium text-brand-600 hover:underline"
                      >
                        View details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Single complaint detail mode (passed as a 1-element array) */}
        </MapContainer>
      </div>

      {isPicker && pickedLocation && (
        <p className="text-sm text-gray-700">
          📍 Lat:{' '}
          <strong className="text-gray-900">{pickedLocation.lat.toFixed(5)}</strong>
          , Lng:{' '}
          <strong className="text-gray-900">{pickedLocation.lng.toFixed(5)}</strong>
        </p>
      )}
    </div>
  );
}
