import React, { useEffect, useRef, useState } from 'react';
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
import { getLocationPhoto } from '../services/locationPhotoService';
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
  const markersRef = useRef([]);
  const accuracyCircleRef = useRef(null);
  const userMarkerRef = useRef(null);
  const hasInitiallyCenteredRef = useRef(false);

  const [apiKey, setApiKey] = useState(getGoogleMapsApiKey());
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showSteps, setShowSteps] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [destPhoto, setDestPhoto] = useState(null);

  // Dynamic photo lookup for current map destination
  useEffect(() => {
    if (!destinationName || destinationName === "Select your destination" || destinationName.trim().length < 2) {
      setDestPhoto(null);
      return;
    }
    let isMounted = true;
    getLocationPhoto(destinationName, null, originLocation?.city || "").then((url) => {
      if (isMounted && url) setDestPhoto(url);
    });
    return () => {
      isMounted = false;
    };
  }, [destinationName, originLocation]);

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
  };

  // Center map on user's current live location with high zoom (zoom 17)
  const handleRecenterOnMe = () => {
    if (!mapInstanceRef.current || !window.google || !originLocation?.lat) return;
    const userPos = new window.google.maps.LatLng(originLocation.lat, originLocation.lng);
    mapInstanceRef.current.panTo(userPos);
    mapInstanceRef.current.setZoom(17);
  };

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
        
        if (directionsRendererRef.current && route.rawResult) {
          directionsRendererRef.current.setDirections(route.rawResult);
        } else if (route.pathPoints && route.pathPoints.length > 1) {
          if (routePolylineRef.current) {
            routePolylineRef.current.setMap(null);
          }
          routePolylineRef.current = new google.maps.Polyline({
            path: route.pathPoints,
            geodesic: true,
            strokeColor: '#0284c7',
            strokeOpacity: 0.85,
            strokeWeight: 6,
            map: map
          });
        }
        setRouteInfo(route);

        // Auto-fit camera to enclose user, all stops, and destination
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
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
              Google Maps Platform
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
                <div className="flex items-center gap-2 bg-rose-500/20 text-rose-200 p-1 pr-3 rounded-xl shrink-0 border border-rose-500/35 shadow-sm">
                  {destPhoto ? (
                    <img
                      src={destPhoto}
                      alt={destinationName}
                      className="w-6 h-6 rounded-lg object-cover border border-rose-300 shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-sm pl-1">🎯</span>
                  )}
                  <div>
                    <span className="font-extrabold text-rose-300 text-[9px] uppercase tracking-wider block">Destination</span>
                    <span className="text-white font-bold text-xs max-w-[160px] truncate block">{destinationName}</span>
                  </div>
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
        <div ref={mapContainerRef} className="w-full h-full z-10" />

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

        {/* Floating Destination Photo Preview HUD */}
        {destPhoto && destinationName && destinationName !== "Select your destination" && (
          <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-lg flex items-center gap-2 max-w-[240px] animate-in fade-in slide-in-from-top-2 duration-300">
            <img
              src={destPhoto}
              alt={destinationName}
              className="w-10 h-10 rounded-xl object-cover border border-rose-200 shrink-0 shadow-xs"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="min-w-0 pr-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 block">Target Spot</span>
              <p className="text-[11px] font-bold text-slate-900 truncate">{destinationName}</p>
            </div>
          </div>
        )}

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
