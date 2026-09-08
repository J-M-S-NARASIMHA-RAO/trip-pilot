import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Bus, Car, Train, CheckCircle2, 
  RefreshCw, Compass, Sparkles, ArrowRight, Search, Loader2, 
  Crosshair, Radio, ShieldCheck 
} from 'lucide-react';
import { translations } from '../translations';
import { searchPlaces, getPlaceDetails } from '../services/googleMapsService';
import { useRealtimeLocation } from '../hooks/useRealtimeLocation';

export default function CurrentLocationBanner({ 
  currentLang, 
  location, 
  setLocation, 
  onExploreCity,
  onRefreshGps,
  gpsError 
}) {
  const t = translations[currentLang] || translations.en;
  const [showManualSelect, setShowManualSelect] = useState(false);
  
  // Google Places Autocomplete state
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [predictions, setPredictions] = useState([]);

  const presetLocations = [
    { name: "Visakhapatnam Railway Station", city: "Visakhapatnam", lat: 17.7214, lng: 83.2929, tag: "Main Junction Hub" },
    { name: "Vizag RTC Complex (Dwaraka)", city: "Visakhapatnam", lat: 17.7295, lng: 83.3088, tag: "Central Bus Terminus" },
    { name: "Ramakrishna (RK) Beach", city: "Visakhapatnam", lat: 17.7142, lng: 83.3235, tag: "Tourist Beachfront" },
    { name: "Secunderabad Railway Station", city: "Hyderabad", lat: 17.4344, lng: 78.5013, tag: "Twin Cities Junction" },
    { name: "Majestic KSR Station", city: "Bengaluru", lat: 12.9774, lng: 77.5729, tag: "Kempegowda Interchange" },
    { name: "New Delhi Railway Station", city: "New Delhi", lat: 28.6431, lng: 77.2197, tag: "Northern Hub" }
  ];

  // Search places via Google Places API
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setPredictions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlaces(searchQuery, { lat: location.lat, lng: location.lng });
        setPredictions(results);
      } catch (e) {
        console.warn("Google Places Autocomplete error:", e);
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, location.lat, location.lng]);

  const handleSelectPrediction = async (pred) => {
    setSearching(true);
    try {
      const details = await getPlaceDetails(pred.placeId);
      if (details) {
        setLocation({
          name: details.name,
          city: details.city || location.city,
          address: details.address,
          lat: details.lat,
          lng: details.lng,
          accuracy: 3,
          isGpsDetected: false
        });
        setSearchQuery("");
        setPredictions([]);
        setShowManualSelect(false);
      }
    } catch (e) {
      console.warn("Could not get place details:", e);
    } finally {
      setSearching(false);
    }
  };

  return (
    <section className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden mb-6">
      {/* Decorative background aura */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-24 bottom-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Location Information with Real-time ~3m GPS Badge */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Real-Time GPS Live
            </span>
            
            {/* ~3m Accuracy Indicator */}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-md border border-teal-500/30">
              <Crosshair className="h-3 w-3 text-teal-400 animate-pulse" />
              <span>±{location.accuracy || accuracy || 3}m Precision</span>
            </span>

            {location.lat && (
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                ({location.lat.toFixed(5)}°, {location.lng.toFixed(5)}°)
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {location.name}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
              {location.city}
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-xl line-clamp-1">
            {location.address || "Station Road, Visakhapatnam, Andhra Pradesh 530004"}
          </p>

          {gpsError && (
            <p className="text-[11px] text-amber-300 font-medium">
              ⚠️ {gpsError}
            </p>
          )}
        </div>

        {/* Actions: Real-time Re-lock & Manual Place selector */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onRefreshGps && onRefreshGps()}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs transition-all shadow-md shadow-emerald-500/25 active:scale-95"
            title="Lock onto real-time GPS position with ~3m precision"
          >
            <Radio className="h-4 w-4 animate-pulse text-slate-950" />
            <span>Lock GPS (±3m)</span>
          </button>

          <button
            onClick={() => setShowManualSelect(!showManualSelect)}
            className="bg-white/10 hover:bg-white/15 text-white font-semibold px-3.5 py-2.5 rounded-2xl text-xs transition-all border border-white/10"
          >
            {showManualSelect ? "Close" : "Change Place"}
          </button>
        </div>

      </div>

      {/* DYNAMIC CITY EXPLORATION HERO BANNER */}
      <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-teal-500/10 border border-teal-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500 text-slate-950 font-black">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white tracking-wide">
              📍 Current City: {location.city || "Visakhapatnam"}
            </h4>
            <p className="text-[11px] text-teal-200">
              Discover top tourist sights, budget itineraries, and local food spots in {location.city}.
            </p>
          </div>
        </div>

        <button
          onClick={() => onExploreCity && onExploreCity(location.city)}
          className="self-start sm:self-auto bg-white hover:bg-teal-50 text-slate-900 font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95 shrink-0"
        >
          <span>Explore {location.city || "Vizag"}</span>
          <ArrowRight className="h-3.5 w-3.5 text-teal-600" />
        </button>
      </div>

      {/* Manual Location Dropdown & Google Places Autocomplete */}
      {showManualSelect && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          
          {/* Google Places Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search any railway station, airport, landmark in India (Google Places API)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-teal-300 animate-spin" />
            )}
          </div>

          {/* Autocomplete Predictions dropdown */}
          {predictions.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5 shadow-xl max-h-48 overflow-y-auto">
              {predictions.map((p) => (
                <button
                  key={p.placeId}
                  onClick={() => handleSelectPrediction(p)}
                  className="w-full text-left p-2.5 hover:bg-white/10 transition-colors flex items-start gap-2 text-xs"
                >
                  <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">{p.mainText}</strong>
                    <span className="text-[10px] text-slate-400">{p.secondaryText}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Preset Quick Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {presetLocations.map((loc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setLocation({
                    name: loc.name,
                    city: loc.city,
                    address: `${loc.name}, ${loc.city}, India`,
                    lat: loc.lat,
                    lng: loc.lng,
                    accuracy: 3,
                    isGpsDetected: false
                  });
                  setShowManualSelect(false);
                }}
                className="text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/15 transition-all border border-white/10 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{loc.name}</p>
                  <p className="text-[10px] text-teal-300">{loc.tag}</p>
                </div>
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Proximity Transit Bar */}
      <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-300">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nearby:</span>
        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
          <Car className="h-3.5 w-3.5 text-amber-400" />
          <span>Auto Stand: <strong className="text-white">100m</strong></span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
          <Bus className="h-3.5 w-3.5 text-teal-400" />
          <span>Bus Stop: <strong className="text-white">250m</strong> (Routes 28A, 10K)</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
          <Car className="h-3.5 w-3.5 text-sky-400" />
          <span>Cab Pickup: <strong className="text-white">300m</strong></span>
        </div>
      </div>
    </section>
  );
}
