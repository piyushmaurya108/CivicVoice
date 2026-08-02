import { useEffect, useState } from 'react';
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
import { Link } from 'react-router-dom';
import {
  LocateFixed,
  Loader2,
  MapPin,
  MousePointerClick,
  Search
} from 'lucide-react';
import {
  TYPE_LABELS,
  SEVERITY_MARKER_HEX,
  formatRelative,
  shortAddress
} from '../utils/formatters.js';
import useGeolocation from '../hooks/useGeolocation.js';
import AddressSearch from './AddressSearch.jsx';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const INDIA_CENTER = [20.5937, 78.9629];
const INDIA_ZOOM = 5;

function severityIcon(severity) {
  const colour = SEVERITY_MARKER_HEX[severity] || '#2563eb';
  const html = `
    <div style="position:relative;width:28px;height:38px;">
      <svg viewBox="0 0 28 38" width="28" height="38" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 14 24 14 24s14-14.5 14-24C28 6.27 21.73 0 14 0z" fill="${colour}" stroke="#fff" stroke-width="2"/>
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

function PickerHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

function FlyTo({ target, zoom = 15 }) {
  const map = useMap();
  useEffect(() => {
    if (target && Number.isFinite(target.lat) && Number.isFinite(target.lng)) {
      map.flyTo([target.lat, target.lng], zoom, { duration: 0.8 });
    }
  }, [target, zoom, map]);
  return null;
}

function MethodButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? 'bg-brand-500 text-white shadow-glow'
          : 'border border-line bg-white text-soft hover:bg-surfaceAlt'
      }`}
      aria-pressed={active}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

export default function ComplaintMap({
  pickedLocation = null,
  onLocationPick,
  complaints = null,
  height = '400px',
  initialCenter = INDIA_CENTER,
  initialZoom = INDIA_ZOOM
}) {
  const isPicker = typeof onLocationPick === 'function';
  const { getLocation, loading: gpsLoading } = useGeolocation();

  const [method, setMethod] = useState('click');
  const [flyTarget, setFlyTarget] = useState(null);
  const [flyZoom, setFlyZoom] = useState(7);

  const handleGPS = async () => {
    try {
      const coords = await getLocation();
      if (onLocationPick) onLocationPick({ lat: coords.lat, lng: coords.lng });
    } catch {
      // handled in hook
    }
  };

  const handleAddressZoom = (target, zoom) => {
    setFlyTarget({ ...target, _t: Date.now() });
    setFlyZoom(zoom);
  };

  return (
    <div className="space-y-4">
      {isPicker && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <MethodButton active={method === 'click'} onClick={() => setMethod('click')} icon={MousePointerClick} label="Click Map" />
            <MethodButton active={method === 'gps'} onClick={() => setMethod('gps')} icon={LocateFixed} label="Use GPS" />
            <MethodButton active={method === 'address'} onClick={() => setMethod('address')} icon={Search} label="Search Address" />
          </div>

          {method === 'click' && (
            <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-600">
              Click anywhere on the map to drop a pin.
            </div>
          )}

          {method === 'gps' && (
            <button type="button" onClick={handleGPS} disabled={gpsLoading} className="primary-button">
              {gpsLoading ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
              {gpsLoading ? 'Locating...' : 'Use my GPS location'}
            </button>
          )}

          {method === 'address' && <AddressSearch onZoom={handleAddressZoom} onPick={onLocationPick} />}
        </div>
      )}

      <div className="overflow-hidden rounded-[28px] border border-line bg-white shadow-soft" style={{ height }}>
        <MapContainer center={initialCenter} zoom={initialZoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {isPicker && <PickerHandler onPick={onLocationPick} />}
          {isPicker && flyTarget && <FlyTo target={flyTarget} zoom={flyZoom} />}
          {isPicker && pickedLocation && (
            <>
              <FlyTo target={pickedLocation} zoom={15} />
              <Marker position={[pickedLocation.lat, pickedLocation.lng]}>
                <Popup>
                  <strong>Selected location</strong>
                  <br />
                  Lat {pickedLocation.lat.toFixed(5)}, Lng {pickedLocation.lng.toFixed(5)}
                </Popup>
              </Marker>
            </>
          )}

          {!isPicker &&
            Array.isArray(complaints) &&
            complaints.map((c) => {
              const coords = c.location?.coordinates;
              if (!Array.isArray(coords) || coords.length !== 2) return null;
              const [lng, lat] = coords;
              return (
                <Marker key={c._id} position={[lat, lng]} icon={severityIcon(c.severity)}>
                  <Popup>
                    <div className="space-y-1 text-xs">
                      <div className="text-sm font-semibold">
                        {TYPE_LABELS[c.type] || c.type}
                        <span className="font-normal text-gray-500 capitalize"> · {c.severity}</span>
                      </div>
                      <div className="text-gray-600">{shortAddress(c.address) || 'Location pending'}</div>
                      <div className="text-gray-500">{formatRelative(c.createdAt)}</div>
                      <Link to={`/complaints/${c._id}`} className="mt-1 inline-block font-medium text-brand-600 hover:underline">
                        View details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      {isPicker && pickedLocation && (
        <p className="flex items-center gap-2 text-sm text-soft">
          <MapPin size={15} className="text-brand-500" />
          Lat <strong className="text-ink">{pickedLocation.lat.toFixed(5)}</strong>, Lng{' '}
          <strong className="text-ink">{pickedLocation.lng.toFixed(5)}</strong>
        </p>
      )}
    </div>
  );
}
