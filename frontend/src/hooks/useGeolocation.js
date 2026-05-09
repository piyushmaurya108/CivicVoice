import { useCallback, useState } from 'react';

/**
 * Custom hook for browser geolocation.
 * Returns: { position, error, loading, getLocation }
 */
export default function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      const msg = 'Geolocation is not supported by your browser.';
      setError(msg);
      return Promise.reject(new Error(msg));
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          };
          setPosition(coords);
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          let msg = 'Unable to retrieve your location';
          if (err.code === 1) msg = 'Location permission denied.';
          if (err.code === 2) msg = 'Location unavailable.';
          if (err.code === 3) msg = 'Location request timed out.';
          setError(msg);
          setLoading(false);
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return { position, error, loading, getLocation };
}
