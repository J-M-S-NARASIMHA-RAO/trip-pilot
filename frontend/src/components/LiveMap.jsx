import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, Navigation, Bus, Car, Train, Landmark, AlertTriangle, 
  Key, Check, ShieldAlert, ArrowRight, Layers, Compass, Sparkles, 
  Crosshair, Radio, RotateCcw, LocateFixed 
} from 'lucide-react';
import { 
  loadGoogleMaps, 
  getGoogleMapsApiKey, 
  setGoogleMapsApiKey, 
  calculateRoute, 
  geocodeAddress,
  findNearestBusStop,
  TRIP_PILOT_MAP_STYLES 
} from '../services/googleMapsService';
import { searchLocalDestinations } from '../data/destinationSuggestions';
import { translations } from '../translations';

export default function LiveMap({ 
  currentLang, 
  originLocation, 
  destinationName, 
  destinationCoords,
  stops = [],
  activeTransport,
  scamHotspots = []
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const routePolylineRef = useRef(null);
  const routeOuterBorderRef = useRef(null);
  const markersRef = useRef([]);
  const accuracyCircleRef = useRef(null);
  const userMarkerRef = useRef(null);
  const hasInitiallyCenteredRef = useRef(false);

  const hasCustomKey = !!localStorage.getItem('trip_pilot_google_maps_key');
  const [apiKey, setApiKey] = useState(getGoogleMapsApiKey());
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showSteps, setShowSteps] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Dual Map Engine Support (Google Maps Platform + OpenStreetMap / CARTO HD)
  const [useOsmMap, setUseOsmMap] = useState(!hasCustomKey);
  const leafletContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletLayersRef = useRef([]);

  // Auto-switch to OpenStreetMap if Google Maps demo key quota or auth limit is reached
  useEffect(() => {
    window.gm_authFailure = () => {
      console.warn("Google Maps quota / auth limit reached. Switching automatically to OpenStreetMap Carto engine.");
      setUseOsmMap(true);
    };
  }, []);

  // Initialize Google Map
  useEffect(() => {
    let isMounted = true;
    setMapError(null);

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        const google = await loadGoogleMaps();
        if (!isMounted) return;

        // Use real-time location or standard fallback
        const centerLat = originLocation?.lat || 17.7214;
        const centerLng = originLocation?.lng || 83.2929;
        const defaultCenter = { lat: centerLat, lng: centerLng };

        if (!mapInstanceRef.current) {
          const map = new google.maps.Map(mapContainerRef.current, {
            center: defaultCenter,
            zoom: originLocation?.lat ? 17 : 14, // Zoom 17 gives clear ~3m visibility
            styles: TRIP_PILOT_MAP_STYLES,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            gestureHandling: 'greedy'
          });

          const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#0284c7',
              strokeWeight: 6,
              strokeOpacity: 0.85
            }
          });

          mapInstanceRef.current = map;
          directionsRendererRef.current = directionsRenderer;
        }

        setIsMapLoaded(true);
        updateMapElements(google, mapInstanceRef.current);
      } catch (err) {
        if (!isMounted) return;
        console.warn("Google Maps init error:", err);
        setMapError(err.message || "Failed to load Google Maps");
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [apiKey, destinationName, destinationCoords, stops, activeTransport]);

  // Real-time GPS coordinate listener: Update user marker & ~3m accuracy circle continuously
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google || !originLocation?.lat) return;
    const google = window.google;

    const curLat = originLocation.lat;
    const curLng = originLocation.lng;
    const curAcc = Math.max(3, Math.round(originLocation.accuracy || 3));
    const userPos = new google.maps.LatLng(curLat, curLng);

    // Initial smooth center once GPS coordinates arrive
    if (!hasInitiallyCenteredRef.current) {
      mapInstanceRef.current.panTo(userPos);
      mapInstanceRef.current.setZoom(17);
      hasInitiallyCenteredRef.current = true;
    }

    // Update real-time accuracy circle (~3m radius)
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setCenter(userPos);
      accuracyCircleRef.current.setRadius(curAcc);
    } else {
      accuracyCircleRef.current = new google.maps.Circle({
        map: mapInstanceRef.current,
        center: userPos,
        radius: curAcc, // Real estimated accuracy in meters (e.g. 3m)
        fillColor: '#0284c7',
        fillOpacity: 0.18,
        strokeColor: '#0284c7',
        strokeOpacity: 0.6,
        strokeWeight: 2,
        zIndex: 10
      });
    }

    // Update user marker position
    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(userPos);
    } else {
      userMarkerRef.current = new google.maps.Marker({
        position: userPos,
        map: mapInstanceRef.current,
        title: "My Real-Time Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#0284c7",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3.5
        },
        zIndex: 999
      });
    }
  }, [originLocation?.lat, originLocation?.lng, originLocation?.accuracy]);

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }
    if (routeOuterBorderRef.current) {
      routeOuterBorderRef.current.setMap(null);
      routeOuterBorderRef.current = null;
    }
  };

  // Center map on user's current live location with high zoom (zoom 17)
  const handleRecenterOnMe = () => {
    if (useOsmMap && leafletMapRef.current && originLocation?.lat) {
      leafletMapRef.current.setView([originLocation.lat, originLocation.lng], 17);
      return;
    }
    if (!mapInstanceRef.current || !window.google || !originLocation?.lat) return;
    const userPos = new window.google.maps.LatLng(originLocation.lat, originLocation.lng);
    mapInstanceRef.current.panTo(userPos);
    mapInstanceRef.current.setZoom(17);
  };

  // OpenStreetMap / Leaflet Engine Effect
  useEffect(() => {
    if (!useOsmMap || !leafletContainerRef.current) return;

    const curLat = originLocation?.lat || 17.7214;
    const curLng = originLocation?.lng || 83.2929;
    const curAcc = Math.max(3, Math.round(originLocation?.accuracy || 3));

    if (!leafletMapRef.current) {
      const map = L.map(leafletContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([curLat, curLng], originLocation?.lat ? 16 : 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    setTimeout(() => {
      try { map.invalidateSize(); } catch (e) {}
    }, 150);

    // Clear previous Leaflet layers
    leafletLayersRef.current.forEach((layer) => {
      try { layer.remove(); } catch (e) {}
    });
    leafletLayersRef.current = [];

    // 1. User position marker (pulsating GPS icon)
    const userHtml = `<div style="width: 18px; height: 18px; background: #0284c7; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(2,132,199,0.8);"></div>`;
    const userIcon = L.divIcon({ className: '', html: userHtml, iconSize: [18, 18], iconAnchor: [9, 9] });
    const userMarker = L.marker([curLat, curLng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    userMarker.bindPopup(`<b>📍 You Are Here (Real-Time GPS)</b><br>Accuracy: ±${curAcc}m`);
    leafletLayersRef.current.push(userMarker);

    // 2. Accuracy circle
    const accCircle = L.circle([curLat, curLng], {
      radius: curAcc,
      color: '#0284c7',
      fillColor: '#0284c7',
      fillOpacity: 0.18,
      weight: 2
    }).addTo(map);
    leafletLayersRef.current.push(accCircle);

    const latLngBounds = L.latLngBounds([[curLat, curLng]]);

    // 3. Render Intermediate Stops
    const resolvedStops = [];
    if (stops && stops.length > 0) {
      stops.forEach((st, idx) => {
        const sName = typeof st === 'string' ? st : (st?.name || `Stop ${idx + 1}`);
        let sLat = st?.lat;
        let sLng = st?.lng;

        if (sLat && sLng) {
          resolvedStops.push({ name: sName, lat: sLat, lng: sLng });
          latLngBounds.extend([sLat, sLng]);

          const stopHtml = `<div style="width: 24px; height: 24px; background: #f59e0b; border: 2.5px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #0f172a; font-weight: 900; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${idx + 1}</div>`;
          const stopIcon = L.divIcon({ className: '', html: stopHtml, iconSize: [24, 24], iconAnchor: [12, 12] });
          const sm = L.marker([sLat, sLng], { icon: stopIcon }).addTo(map);
          sm.bindPopup(`<b>Stop ${idx + 1}: ${sName}</b>`);
          leafletLayersRef.current.push(sm);
        }
      });
    }

    // 4. Render Destination Position
    let destLat = destinationCoords?.lat;
    let destLng = destinationCoords?.lng;

    if (!destLat || !destLng) {
      if (destinationName && destinationName !== "Select your destination" && destinationName.trim().length > 1) {
        const localMatches = searchLocalDestinations(destinationName, originLocation?.city || 'Visakhapatnam');
        if (localMatches && localMatches.length > 0 && localMatches[0].lat && localMatches[0].lng) {
          destLat = localMatches[0].lat;
          destLng = localMatches[0].lng;
        }
      }
    }

    if (destLat && destLng) {
      latLngBounds.extend([destLat, destLng]);

      const destHtml = `<div style="width: 32px; height: 32px; background: #e11d48; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 3px 8px rgba(0,0,0,0.4);">🎯</div>`;
      const destIcon = L.divIcon({ className: '', html: destHtml, iconSize: [32, 32], iconAnchor: [16, 16] });
      const dm = L.marker([destLat, destLng], { icon: destIcon, zIndexOffset: 950 }).addTo(map);
      dm.bindPopup(`<b>Final Destination: ${destinationName || 'Destination'}</b>`);
      leafletLayersRef.current.push(dm);

      // 5. Calculate and render Turn-by-Turn Road Route Polyline
      const travelMode = activeTransport === 'WALK' ? 'WALKING' : (activeTransport === 'BUS' ? 'TRANSIT' : 'DRIVING');
      calculateRoute(
        { lat: curLat, lng: curLng },
        { lat: destLat, lng: destLng },
        travelMode,
        resolvedStops.map((s) => ({ lat: s.lat, lng: s.lng }))
      ).then((route) => {
        if (!route) return;
        setRouteInfo(route);

        if (route.pathPoints && route.pathPoints.length > 1) {
          const polyPoints = route.pathPoints.map((p) =>
            typeof p.lat === 'function' ? [p.lat(), p.lng()] : [p.lat, p.lng]
          );

          // Outer navy casing
          const outerLine = L.polyline(polyPoints, {
            color: '#1e3a8a',
            weight: 8,
            opacity: 0.85
          }).addTo(map);
          leafletLayersRef.current.push(outerLine);

          // Inner vibrant electric blue road line
          const innerLine = L.polyline(polyPoints, {
            color: '#2563eb',
            weight: 5,
            opacity: 1.0
          }).addTo(map);
          leafletLayersRef.current.push(innerLine);

          map.fitBounds(outerLine.getBounds(), { padding: [45, 45] });
        } else {
          map.fitBounds(latLngBounds, { padding: [45, 45] });
        }
      }).catch((err) => {
        console.warn("Leaflet route error:", err);
        map.fitBounds(latLngBounds, { padding: [45, 45] });
      });
    } else {
      setRouteInfo(null);
      if (resolvedStops.length > 0) {
        map.fitBounds(latLngBounds, { padding: [45, 45] });
      } else {
        map.setView([curLat, curLng], 16);
      }
    }
  }, [useOsmMap, originLocation?.lat, originLocation?.lng, destinationName, destinationCoords, stops, activeTransport]);

  // Update Route, Markers & Elements
  const updateMapElements = async (google, map) => {
    clearMarkers();

    const curLat = originLocation?.lat || 17.7214;
    const curLng = originLocation?.lng || 83.2929;
    const curAcc = Math.max(3, Math.round(originLocation?.accuracy || 3));
    const originPos = new google.maps.LatLng(curLat, curLng);

    // 1. Live User Marker & Accuracy Circle
    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = new google.maps.Circle({
        map: map,
        center: originPos,
        radius: curAcc,
        fillColor: '#0284c7',
        fillOpacity: 0.18,
        strokeColor: '#0284c7',
        strokeOpacity: 0.6,
        strokeWeight: 2,
        zIndex: 10
      });
    } else {
      accuracyCircleRef.current.setCenter(originPos);
      accuracyCircleRef.current.setRadius(curAcc);
    }

    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position: originPos,
        map: map,
        title: "My Real-Time Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#0284c7",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3.5
        },
        zIndex: 999
      });

      const originInfoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 6px; font-family: sans-serif;">
          <strong style="color: #0284c7;">📍 You Are Here (Real-Time GPS)</strong>
          <p style="margin: 4px 0 0; font-size: 11px; color: #475569;">${originLocation?.address || "Real-time satellite GPS lock"}</p>
          <span style="font-size: 10px; color: #10b981; font-weight: bold;">● Accuracy: ±${curAcc} meters</span>
        </div>`
      });
      userMarkerRef.current.addListener('click', () => originInfoWindow.open(map, userMarkerRef.current));
    } else {
      userMarkerRef.current.setPosition(originPos);
    }

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(originPos);

    // 2. Resolve and render all intermediate stops
    const resolvedStops = [];
    if (stops && stops.length > 0) {
      for (let i = 0; i < stops.length; i++) {
        const st = stops[i];
        const stopName = typeof st === 'string' ? st : (st?.name || `Stop ${i + 1}`);
        let stopPos = null;

        if (st && typeof st === 'object' && st.lat && st.lng) {
          stopPos = new google.maps.LatLng(st.lat, st.lng);
        } else if (stopName && stopName.trim().length > 1) {
          try {
            const geo = await geocodeAddress(`${stopName}, ${originLocation?.city || 'Visakhapatnam'}`);
            if (geo?.lat && geo?.lng) {
              stopPos = new google.maps.LatLng(geo.lat, geo.lng);
            }
          } catch (e) {
            console.warn(`Could not geocode stop ${stopName}:`, e);
          }
        }

        if (stopPos) {
          resolvedStops.push({ name: stopName, position: stopPos, index: i + 1 });
          bounds.extend(stopPos);

          const stopMarker = new google.maps.Marker({
            position: stopPos,
            map: map,
            title: `Stop ${i + 1}: ${stopName}`,
            label: {
              text: `${i + 1}`,
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "12px"
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 14,
              fillColor: "#f59e0b", // Amber indicator for stops
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2.5
            },
            zIndex: 800 + i
          });

          const stopInfoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 6px; font-family: sans-serif;">
              <span style="background: #fef3c7; color: #b45309; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">Stop ${i + 1}</span>
              <strong style="display: block; margin-top: 4px; color: #0f172a; font-size: 13px;">${stopName}</strong>
              <p style="margin: 2px 0 0; font-size: 11px; color: #64748b;">Intermediate stop in this trip</p>
            </div>`
          });
          stopMarker.addListener('click', () => stopInfoWindow.open(map, stopMarker));
          markersRef.current.push(stopMarker);
        }
      }
    }

    // 3. Resolve and render Destination Position if set
    let destPos = null;
    if (destinationCoords?.lat && destinationCoords?.lng) {
      destPos = new google.maps.LatLng(destinationCoords.lat, destinationCoords.lng);
    } else if (destinationName && destinationName !== "Select your destination" && destinationName.trim().length > 1) {
      // Prioritize local curated destinations (e.g. Gajuwaka Junction, RK Beach, etc.)
      const localMatches = searchLocalDestinations(destinationName, originLocation?.city || 'Visakhapatnam');
      if (localMatches && localMatches.length > 0 && localMatches[0].lat && localMatches[0].lng) {
        destPos = new google.maps.LatLng(localMatches[0].lat, localMatches[0].lng);
      } else {
        const dName = destinationName.toLowerCase();
        if (dName.includes("beach") || dName.includes("rk")) {
          destPos = new google.maps.LatLng(17.7142, 83.3235);
        } else if (dName.includes("kailasagiri")) {
          destPos = new google.maps.LatLng(17.7492, 83.3421);
        } else if (dName.includes("submarine")) {
          destPos = new google.maps.LatLng(17.7169, 83.3323);
        } else {
          try {
            const geo = await geocodeAddress(`${destinationName}, ${originLocation?.city || 'Visakhapatnam'}`);
            if (geo?.lat && geo?.lng) {
              destPos = new google.maps.LatLng(geo.lat, geo.lng);
            }
          } catch (e) {
            console.warn(`Could not geocode destination ${destinationName}:`, e);
          }
        }
      }
    }

    if (destPos) {
      bounds.extend(destPos);

      const destMarker = new google.maps.Marker({
        position: destPos,
        map: map,
        title: destinationName || "Destination",
        label: {
          text: "🎯",
          fontSize: "18px"
        },
        zIndex: 950
      });

      const destInfoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 6px; font-family: sans-serif;">
          <span style="background: #ffe4e6; color: #e11d48; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">Final Destination</span>
          <strong style="display: block; margin-top: 4px; color: #0f172a; font-size: 13px;">${destinationName || "Destination"}</strong>
        </div>`
      });
      destMarker.addListener('click', () => destInfoWindow.open(map, destMarker));
      markersRef.current.push(destMarker);

      // Render nearest bus stop if transit/bus mode is selected
      if (activeTransport === 'BUS') {
        const busStop = findNearestBusStop(curLat, curLng, originLocation?.city || 'Visakhapatnam');
        const busStopPos = new google.maps.LatLng(busStop.lat, busStop.lng);
        bounds.extend(busStopPos);

        const busMarker = new google.maps.Marker({
          position: busStopPos,
          map: map,
          title: `Nearest Bus Stop: ${busStop.name}`,
          label: {
            text: "🚏",
            fontSize: "18px"
          },
          zIndex: 920
        });

        const busInfoWindow = new google.maps.InfoWindow({
          content: `<div style="padding: 6px; font-family: sans-serif;">
            <span style="background: #ccfbf1; color: #0f766e; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">Nearest Bus Stop</span>
            <strong style="display: block; margin-top: 4px; color: #0f172a; font-size: 13px;">${busStop.name}</strong>
            <p style="margin: 2px 0 0; font-size: 11px; color: #0f766e; font-weight: bold;">🚶 ${busStop.directionsSummary}</p>
            <span style="font-size: 10px; color: #64748b;">Routes: ${busStop.routes.join(', ')}</span>
          </div>`
        });
        busMarker.addListener('click', () => busInfoWindow.open(map, busMarker));
        markersRef.current.push(busMarker);
      }

      // Calculate Google Routes Directions with all intermediate stops
      try {
        const travelMode = activeTransport === 'WALK' ? 'WALKING' : (activeTransport === 'BUS' ? 'TRANSIT' : 'DRIVING');
        const waypoints = resolvedStops.map((s) => s.position);
        const route = await calculateRoute(originPos, destPos, travelMode, waypoints);
        
        // Reset renderer and polyline references
        if (directionsRendererRef.current) {
          directionsRendererRef.current.set('directions', null);
        }
        if (routePolylineRef.current) {
          routePolylineRef.current.setMap(null);
          routePolylineRef.current = null;
        }
        if (routeOuterBorderRef.current) {
          routeOuterBorderRef.current.setMap(null);
          routeOuterBorderRef.current = null;
        }

        if (directionsRendererRef.current && route.rawResult) {
          directionsRendererRef.current.setDirections(route.rawResult);
        } else if (route.pathPoints && route.pathPoints.length > 1) {
          // Signature Google Maps turn-by-turn road navigation polyline:
          // 1. Dark navy border / casing
          routeOuterBorderRef.current = new google.maps.Polyline({
            path: route.pathPoints,
            geodesic: true,
            strokeColor: '#1e3a8a',
            strokeOpacity: 0.85,
            strokeWeight: 8,
            zIndex: 50,
            map: map
          });
          // 2. Inner vibrant electric blue road line
          routePolylineRef.current = new google.maps.Polyline({
            path: route.pathPoints,
            geodesic: true,
            strokeColor: '#2563eb',
            strokeOpacity: 1.0,
            strokeWeight: 5,
            zIndex: 51,
            map: map
          });
        }
        setRouteInfo(route);

        // Auto-fit camera to enclose the entire road route or bounds
        if (route.bounds) {
          map.fitBounds(route.bounds, { top: 60, bottom: 60, left: 60, right: 60 });
        } else {
          map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
        }
      } catch (routeErr) {
        console.warn("Could not calculate Google Routes:", routeErr);
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      }
    } else {
      // No destination set yet
      if (directionsRendererRef.current) {
        directionsRendererRef.current.set('directions', null);
      }
      setRouteInfo(null);

      // If stops were added without a final destination, frame all stops
      if (resolvedStops.length > 0) {
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      }
    }
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) return;
    setGoogleMapsApiKey(apiKeyInput.trim());
    setApiKey(apiKeyInput.trim());
    setShowKeyModal(false);
    window.location.reload();
  };

  const liveAccuracy = originLocation?.accuracy ? Math.round(originLocation.accuracy) : 3;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-5 sm:p-6 mb-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              {useOsmMap ? "OpenStreetMap Carto HD" : "Google Maps Platform"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE GPS ACCURACY: ±{liveAccuracy}m</span>
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <span>🗺️ Real-Time GPS Tracking Map</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={handleRecenterOnMe}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
            title="Recenter on my exact location"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            <span>Recenter (±{liveAccuracy}m)</span>
          </button>

          <button
            onClick={() => {
              setUseOsmMap(!useOsmMap);
              setTimeout(() => {
                if (leafletMapRef.current) leafletMapRef.current.invalidateSize();
              }, 150);
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 font-bold transition-all shadow-xs active:scale-95"
            title="Toggle Map Engine between Google Maps and OpenStreetMap"
          >
            <Layers className="h-3.5 w-3.5 text-teal-600" />
            <span>{useOsmMap ? "Switch to Google Maps" : "Switch to OpenStreetMap"}</span>
          </button>

          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 font-semibold transition-all"
            title="Configure Google Maps API Key"
          >
            <Key className="h-3.5 w-3.5 text-teal-600" />
            <span>API Key</span>
          </button>
        </div>
      </div>

      {/* Visual Multi-Stop Trip Itinerary Sequence Strip */}
      {(destinationName || (stops && stops.length > 0)) && (
        <div className="mb-4 p-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 text-white rounded-2xl shadow-md border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5" /> Full Trip Itinerary ({1 + (stops?.length || 0) + (destinationName ? 1 : 0)} Locations)
            </span>
            {routeInfo && (
              <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-xl text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Optimal Shortest Route: <strong className="text-white">{routeInfo.distanceText}</strong> (~{routeInfo.durationText})</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            {/* 1. Origin (Live GPS) */}
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl shrink-0 border border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="font-extrabold text-sky-300 text-[10px] uppercase tracking-wider">Start</span>
              <span className="text-white font-bold max-w-[150px] truncate">{originLocation?.name || "Live GPS"}</span>
            </div>

            {/* 2. Intermediate Stops */}
            {stops && stops.map((st, idx) => {
              const sName = typeof st === 'string' ? st : (st?.name || `Stop ${idx + 1}`);
              return (
                <React.Fragment key={idx}>
                  <ArrowRight className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-200 px-3 py-1.5 rounded-xl shrink-0 border border-amber-500/35 shadow-sm">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-amber-300 text-[10px] uppercase tracking-wider">Stop {idx + 1}</span>
                    <span className="text-white font-bold max-w-[150px] truncate">{sName}</span>
                  </div>
                </React.Fragment>
              );
            })}

            {/* 3. Final Destination */}
            {destinationName && destinationName !== "Select your destination" && (
              <>
                <ArrowRight className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <div className="flex items-center gap-1.5 bg-rose-500/20 text-rose-200 px-3 py-1.5 rounded-xl shrink-0 border border-rose-500/35 shadow-sm">
                  <span className="text-sm">🎯</span>
                  <span className="font-extrabold text-rose-300 text-[10px] uppercase tracking-wider">Destination</span>
                  <span className="text-white font-bold max-w-[160px] truncate">{destinationName}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Live Route Summary Bar */}
      {routeInfo && (
        <div className="mb-3 p-3 bg-gradient-to-r from-teal-50 via-slate-50 to-emerald-50 rounded-2xl border border-teal-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Road Distance</span>
              <p className="font-black text-slate-800 text-sm">{routeInfo.distanceText || `${routeInfo.distanceKm} km`}</p>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Est. Transit Time</span>
              <p className="font-black text-teal-700 text-sm">{routeInfo.durationText || `${routeInfo.durationMinutes} mins`}</p>
            </div>
          </div>

          {routeInfo.steps && routeInfo.steps.length > 0 && (
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="text-teal-700 hover:text-teal-800 font-bold text-xs flex items-center gap-1 underline underline-offset-2"
            >
              {showSteps ? "Hide Turn Steps" : `View ${routeInfo.steps.length} Turn Instructions`}
            </button>
          )}
        </div>
      )}

      {/* Turn-by-turn navigation drawer */}
      {showSteps && routeInfo?.steps && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-48 overflow-y-auto space-y-1.5 text-xs">
          <h4 className="font-black text-slate-700 text-[11px] uppercase tracking-wider mb-1">
            Turn-by-Turn Navigation Steps (Google Routes API)
          </h4>
          {routeInfo.steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 text-slate-700 py-1 border-b border-slate-100 last:border-0">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium">{step.instruction}</p>
                <span className="text-[10px] text-slate-400">{step.distanceText} • {step.durationText}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map Element */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner h-[400px] sm:h-[480px] bg-slate-100">
        <div ref={mapContainerRef} className={useOsmMap ? 'hidden' : 'w-full h-full z-10'} />
        <div ref={leafletContainerRef} className={useOsmMap ? 'w-full h-full z-10' : 'hidden'} />

        {/* Live Floating GPS HUD Overlay */}
        <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200/80 shadow-lg text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-black text-slate-900 uppercase text-[11px] tracking-wide">
              Live Satellite GPS Lock
            </span>
          </div>
          <div className="text-[11px] text-slate-600 font-mono">
            {originLocation?.lat ? (
              <>
                <span>{originLocation.lat.toFixed(6)}° N, {originLocation.lng.toFixed(6)}° E</span>
                <br />
                <span className="text-emerald-700 font-bold">Accuracy Radius: ±{liveAccuracy}m</span>
              </>
            ) : (
              <span className="text-amber-600 animate-pulse">Acquiring high-accuracy satellite signal...</span>
            )}
          </div>
        </div>

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200/80 shadow-lg text-[11px] flex flex-wrap items-center gap-2.5 max-w-[90%]">
          <span className="flex items-center gap-1.5 font-bold text-sky-700">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 border border-white" />
            Live GPS (±{liveAccuracy}m)
          </span>

          {stops && stops.length > 0 && (
            <span className="flex items-center gap-1.5 font-bold text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
              {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'}
            </span>
          )}

          {destinationName && destinationName !== "Select your destination" && (
            <span className="flex items-center gap-1 font-bold text-rose-700">
              <span>🎯</span>
              <span className="max-w-[130px] truncate">{destinationName}</span>
            </span>
          )}
        </div>
      </div>

      {/* Google Maps API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Google Maps Platform Key</h3>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Your API key is active. You can update or replace it here anytime.
            </p>

            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Google Maps API Key
            </label>
            <input
              type="text"
              placeholder="Paste your AIzaSy... key here"
              value={apiKeyInput || apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4 font-mono"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md"
              >
                Save & Reload Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
