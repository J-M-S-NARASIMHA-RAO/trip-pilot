import { useState, useEffect, useRef } from 'react';
import { reverseGeocode } from '../services/googleMapsService';

/**
 * Real-Time High-Accuracy GPS Tracking Hook (Approximate to ~3m in real life)
 * With instant GPS prompt, continuous tracking, and fast IP-location warm fallback
 */
export function useRealtimeLocation(onLocationUpdate) {
  const [coords, setCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const watchIdRef = useRef(null);
  const lastGeocodeCoords = useRef(null);
  const isGeocodingRef = useRef(false);
  const hasReceivedGps = useRef(false);

  // Fast IP-based warm fallback to identify user's real city instantly
  const tryIpFallback = async () => {
    if (hasReceivedGps.current) return;
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      const data = await res.json();
      if (!hasReceivedGps.current && data && data.city) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        setCoords({ lat, lng });
        setAccuracy(500); // coarse IP estimate
        if (onLocationUpdate) {
          onLocationUpdate({
            name: `${data.city} Area`,
            city: data.city,
            address: `${data.city}, ${data.region || ''} ${data.country || 'India'}`,
            lat,
            lng,
            accuracy: 500,
            isGpsDetected: false,
            isLocating: false
          });
        }
      }
    } catch (e) {
      // IP fallback failed, wait for GPS
    }
  };

  const startTracking = () => {
    setIsTracking(true);
    setErrorMsg(null);

    // Try fast IP fallback in background while GPS satellite signal locks
    tryIpFallback();

    if ("geolocation" in navigator) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      // Options for high accuracy and fresh data
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      // Success callback function
      function success(position) {
        hasReceivedGps.current = true;
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = position.coords.accuracy;

        console.log(`Live GPS: Lat ${lat}, Lng ${lng} (Precision: ±${acc}m)`);

        setCoords({ lat, lng });
        setAccuracy(acc);

        // Reverse geocode to resolve actual street & city in real time
        const shouldGeocode = !lastGeocodeCoords.current || (
          Math.abs(lat - lastGeocodeCoords.current.lat) > 0.00015 ||
          Math.abs(lng - lastGeocodeCoords.current.lng) > 0.00015
        );

        if (shouldGeocode && !isGeocodingRef.current) {
          isGeocodingRef.current = true;
          lastGeocodeCoords.current = { lat, lng };

          reverseGeocode(lat, lng)
            .then((geoDetails) => {
              if (onLocationUpdate && geoDetails) {
                onLocationUpdate({
                  name: geoDetails.name || `Live GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
                  city: geoDetails.city || "Current City",
                  address: geoDetails.address || `GPS: ${lat.toFixed(5)}°, ${lng.toFixed(5)}°`,
                  lat: lat,
                  lng: lng,
                  accuracy: acc,
                  isGpsDetected: true,
                  isLocating: false
                });
              }
            })
            .catch(() => {
              if (onLocationUpdate) {
                onLocationUpdate({
                  name: `Live GPS Position (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
                  city: "Live Location",
                  address: `GPS Coordinates: ${lat.toFixed(5)}°, ${lng.toFixed(5)}°`,
                  lat,
                  lng,
                  accuracy: acc,
                  isGpsDetected: true,
                  isLocating: false
                });
              }
            })
            .finally(() => {
              isGeocodingRef.current = false;
            });
        } else if (onLocationUpdate) {
          onLocationUpdate({
            lat,
            lng,
            accuracy: acc,
            isGpsDetected: true,
            isLocating: false
          });
        }
      }

      // Error callback function
      function error(err) {
        console.warn(`GPS Error (${err.code}): ${err.message}`);
        if (err.code === 1) {
          setErrorMsg("Please grant location permission to view your real-time live position (~3m accuracy).");
        } else {
          setErrorMsg(`GPS search: ${err.message}`);
        }
        setIsTracking(false);
      }

      // Immediate one-shot fix
      navigator.geolocation.getCurrentPosition(success, error, options);

      // Continuous high-precision watch
      const watchId = navigator.geolocation.watchPosition(success, error, options);
      watchIdRef.current = watchId;

    } else {
      console.log("Geolocation is not supported by your browser");
      setErrorMsg("Geolocation is not supported by your browser.");
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
    };
  }, []);

  return {
    coords,
    accuracy,
    isTracking,
    errorMsg,
    startTracking,
    stopTracking
  };
}

