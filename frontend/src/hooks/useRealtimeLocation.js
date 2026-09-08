import { useState, useEffect, useRef } from 'react';
import { reverseGeocode } from '../services/googleMapsService';

/**
 * Real-Time High-Accuracy GPS Tracking Hook (Approximate to ~3m in real life)
 */
export function useRealtimeLocation(onLocationUpdate) {
  const [coords, setCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const watchIdRef = useRef(null);
  const lastGeocodeCoords = useRef(null);
  const isGeocodingRef = useRef(false);

  const startTracking = () => {
    if ("geolocation" in navigator) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      setIsTracking(true);
      setErrorMsg(null);

      // Options for high accuracy and fresh data
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      // Success callback function
      function success(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = position.coords.accuracy;

        console.log(`Latitude: ${lat}, Longitude: ${lng} (Estimated accuracy: ${acc} meters)`);

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
                  name: geoDetails.name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
                  city: geoDetails.city || "Current Location",
                  address: geoDetails.address || `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
                  lat: lat,
                  lng: lng,
                  accuracy: acc,
                  isGpsDetected: true
                });
              }
            })
            .catch(() => {
              if (onLocationUpdate) {
                onLocationUpdate({
                  lat,
                  lng,
                  accuracy: acc,
                  isGpsDetected: true
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
            isGpsDetected: true
          });
        }
      }

      // Error callback function
      function error(err) {
        console.warn(`ERROR (${err.code}): ${err.message}`);
        if (err.code === 1) {
          setErrorMsg("Please grant location permission to view your real-time live position (~3m accuracy).");
        } else {
          setErrorMsg(`GPS search: ${err.message}`);
        }
        setIsTracking(false);
      }

      // Start watching the live location
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
