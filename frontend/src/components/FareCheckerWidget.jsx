import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, 
  HelpCircle, ChevronDown, ChevronUp, DollarSign, Bus, Car, Footprints, 
  TrendingUp, Sparkles, Navigation, Plus, Trash2, ExternalLink, Copy, Check,
  Search, Loader2, QrCode, GraduationCap, MapPin, Flag, Clock, X
} from 'lucide-react';
import { translations } from '../translations';
import { checkFare, getRapidoAndUberUrls, getLiveTaxiRates } from '../api';
import { searchPlaces, getPlaceDetails, calculateRoute } from '../services/googleMapsService';
import { saveLocalScamReport } from '../services/safetyService';
import speechService from '../services/speechService';
import BusTransitGuide from './BusTransitGuide';
import ProviderComparisonTable from './ProviderComparisonTable';
import { getPopularDestinationsForCity, searchLocalDestinations } from '../data/destinationSuggestions';

export default function FareCheckerWidget({ 
  currentLang, 
  originLocation, 
  destination: propDestination,
  destCoords: propDestCoords,
  stops: propStops,
  onSelectPlan, 
  onDestinationChange,
  onStopsChange,
  onScamReported 
}) {
  const t = translations[currentLang] || translations.en;

  // Custom user-chosen destination
  const [localDestination, setLocalDestination] = useState("");
  const [localDestCoords, setLocalDestCoords] = useState(null);

  const destination = propDestination !== undefined && propDestination !== "" ? propDestination : localDestination;
  const destCoords = propDestCoords !== undefined ? propDestCoords : localDestCoords;

  const setDestination = (newDest, newCoords = null) => {
    setLocalDestination(newDest);
    setLocalDestCoords(newCoords);
    if (onDestinationChange) onDestinationChange(newDest, newCoords);
  };

  // Autocomplete state for destination
  const [destSearch, setDestSearch] = useState(destination || "");
  const [searching, setSearching] = useState(false);
  const [destPredictions, setDestPredictions] = useState([]);

  // Spotlight photo, rating & address state (prevents ReferenceErrors)
  const [destinationPhoto, setDestinationPhoto] = useState(null);
  const [destRating, setDestRating] = useState(null);
  const [destAddress, setDestAddress] = useState("");

  // Live Location & Popular relative destinations calculation (Memoized)
  const liveCity = originLocation?.city && originLocation.city !== "Detecting City..." ? originLocation.city : "Visakhapatnam";
  const liveLat = originLocation?.lat || null;
  const liveLng = originLocation?.lng || null;

  const popularLiveDestinations = useMemo(() => {
    const coords = liveLat && liveLng ? { lat: liveLat, lng: liveLng } : null;
    return getPopularDestinationsForCity(liveCity, coords);
  }, [liveCity, liveLat, liveLng]);

  // Sync destSearch if parent destination prop changes (e.g., scenario clicked)
  useEffect(() => {
    if (propDestination !== undefined && propDestination !== destSearch) {
      setDestSearch(propDestination);
    }
  }, [propDestination]);

  // Handle selecting any suggested destination (from quick tray or dropdown)
  const handleSelectSuggestedDestination = (dest) => {
    const relativeName = dest.relativeName || `${dest.name}, ${dest.city}`;
    const coords = { lat: dest.lat, lng: dest.lng };

    setDestSearch(relativeName);
    setDestination(relativeName, coords);
    setDestinationPhoto(dest.imageUrl || null);
    setDestRating(dest.rating || null);
    setDestAddress(dest.address || `${dest.name}, ${dest.city}, India`);
    setDestPredictions([]);

    if (onDestinationChange) {
      onDestinationChange(relativeName, coords);
    }
  };

  // Clear destination field
  const handleClearDestination = () => {
    setDestSearch("");
    setDestination("", null);
    setDestinationPhoto(null);
    setDestRating(null);
    setDestAddress("");
    setDestPredictions([]);
    if (onDestinationChange) {
      onDestinationChange("", null);
    }
  };

  // Multi-stop ride feature
  const [localStops, setLocalStops] = useState([]);
  const stops = propStops !== undefined ? propStops : localStops;

  const setStops = (newStops) => {
    setLocalStops(newStops);
    if (onStopsChange) onStopsChange(newStops);
  };

  const [stopSearch, setStopSearch] = useState("");
  const [stopSearching, setStopSearching] = useState(false);
  const [stopPredictions, setStopPredictions] = useState([]);
  const [showAddStop, setShowAddStop] = useState(false);

  const [transportType, setTransportType] = useState("AUTO");
  const [quotedFare, setQuotedFare] = useState("100");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [liveRates, setLiveRates] = useState([]);
  const [liveRateCategory, setLiveRateCategory] = useState("ALL");
  const [refreshCountdown, setRefreshCountdown] = useState(12);
  const [estimatedDistanceKm, setEstimatedDistanceKm] = useState(null);
  const [estimatedDurationMins, setEstimatedDurationMins] = useState(null);
  const [showBusGuide, setShowBusGuide] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Hackathon Presentation Modals
  const [showQrModal, setShowQrModal] = useState(false);
  const [showScamModal, setShowScamModal] = useState(false);
  const [isStudentVerified, setIsStudentVerified] = useState(false);

  // Scam report form state
  const [scamStandName, setScamStandName] = useState("Station Main Gate Auto Stand");
  const [scamTactic, setScamTactic] = useState("Meter Refusal & Unfair Quoted Fare");
  const [scamVehicleReg, setScamVehicleReg] = useState("");
  const [reportSuccessToast, setReportSuccessToast] = useState(false);

  // Hybrid Autocomplete search for Destination (Local Registry + Google Places)
  useEffect(() => {
    if (!destSearch || destSearch.trim().length < 1) {
      setDestPredictions([]);
      return;
    }

    // 1. Instant local matching suggestions
    const coords = liveLat && liveLng ? { lat: liveLat, lng: liveLng } : null;
    const localMatches = searchLocalDestinations(destSearch, liveCity, coords);
    const formattedLocal = localMatches.slice(0, 6).map(item => ({
      placeId: item.id,
      mainText: item.name,
      secondaryText: item.relativeName + (item.distanceKm ? ` • ${item.distanceKm} km away` : ` • ${item.city}`),
      fullItem: item,
      isLocal: true
    }));
    setDestPredictions(formattedLocal);

    // 2. Also query Google Places if online and query >= 2 chars
    if (destSearch.trim().length >= 2) {
      const timer = setTimeout(async () => {
        setSearching(true);
        try {
          const results = await searchPlaces(destSearch, {
            lat: liveLat || 17.7214,
            lng: liveLng || 83.2929
          });
          if (results && results.length > 0) {
            setDestPredictions(prev => {
              const existingTexts = new Set(prev.map(p => p.mainText.toLowerCase()));
              const filteredGoogle = results.filter(r => !existingTexts.has(r.mainText.toLowerCase()));
              return [...prev, ...filteredGoogle].slice(0, 8);
            });
          }
        } catch (e) {
          console.warn("Places search error:", e);
        } finally {
          setSearching(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [destSearch, liveCity, liveLat, liveLng]);

  const handleSelectDestPrediction = async (p) => {
    if (p.fullItem) {
      handleSelectSuggestedDestination(p.fullItem);
      return;
    }

    setSearching(true);
    try {
      const details = await getPlaceDetails(p.placeId);
      if (details) {
        const destName = details.name;
        const coords = { lat: details.lat, lng: details.lng };
        setDestSearch(destName);
        setDestination(destName, coords);
        if (details.photos && details.photos.length > 0) {
          setDestinationPhoto(details.photos[0]);
        }
        if (details.rating) setDestRating(details.rating);
        if (details.address) setDestAddress(details.address);
        if (onDestinationChange) {
          onDestinationChange(destName, coords);
        }
      } else {
        setDestSearch(p.mainText);
        setDestination(p.mainText);
        if (onDestinationChange) {
          onDestinationChange(p.mainText, null);
        }
      }
      setDestPredictions([]);
    } catch (e) {
      setDestSearch(p.mainText);
      setDestination(p.mainText);
      setDestPredictions([]);
    } finally {
      setSearching(false);
    }
  };

  // Google Places search for Intermediate Stop
  useEffect(() => {
    if (!stopSearch || stopSearch.trim().length < 2) {
      setStopPredictions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setStopSearching(true);
      try {
        const results = await searchPlaces(stopSearch, {
          lat: originLocation?.lat || 17.7214,
          lng: originLocation?.lng || 83.2929
        });
        setStopPredictions(results);
      } catch (e) {
        console.warn("Stop places search error:", e);
      } finally {
        setStopSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [stopSearch, originLocation]);

  // Add intermediate stop
  const handleAddStop = (stopItem) => {
    const item = stopItem || stopSearch.trim();
    if (!item) return;
    setStops([...stops, item]);
    setStopSearch("");
    setStopPredictions([]);
    setShowAddStop(false);
  };

  const handleRemoveStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  // Real-time shortest distance calculation whenever destination or stops change
  useEffect(() => {
    if (!destination || destination.trim().length < 2) {
      setEstimatedDistanceKm(null);
      setEstimatedDurationMins(null);
      return;
    }

    let isMounted = true;
    const computeDistance = async () => {
      try {
        const route = await calculateRoute(
          { lat: originLocation?.lat || 17.7214, lng: originLocation?.lng || 83.2929 },
          destCoords || destination,
          'DRIVING',
          stops
        );
        if (isMounted && route) {
          setEstimatedDistanceKm(route.distanceKm);
          setEstimatedDurationMins(route.durationMinutes);
        }
      } catch (e) {
        // Fallback distance calculation
        const dName = destination.toLowerCase();
        let baseDist = 3.5;
        if (dName.includes("beach") || dName.includes("rk")) baseDist = 5.2;
        else if (dName.includes("kailasagiri")) baseDist = 11.5;
        else if (dName.includes("rushikonda")) baseDist = 17.0;
        else if (dName.includes("submarine")) baseDist = 5.5;
        else if (dName.includes("complex") || dName.includes("dwaraka")) baseDist = 2.8;
        const total = Math.round((baseDist + (stops.length * 2.5)) * 10) / 10;
        if (isMounted) {
          setEstimatedDistanceKm(total);
          setEstimatedDurationMins(Math.round(total * 2.8) + 4);
        }
      }
    };

    computeDistance();
    return () => { isMounted = false; };
  }, [destination, destCoords, stops, originLocation]);

  // Perform fare check on explicit Submit
  const handleCheckFare = async () => {
    if (!destination || !destination.trim()) {
      return;
    }

    setLoading(true);
    setHasChecked(true);
    try {
      const res = await checkFare({
        source: originLocation?.name || "Visakhapatnam Railway Station",
        destination: destination,
        stops: stops,
        transportationType: transportType,
        quotedFare: Number(quotedFare) || 100,
        city: originLocation?.city || "Visakhapatnam",
        passengers: 1
      });
      setAnalysis(res);

      // Fetch live updating rates for Rapido & Uber with auto-filled coordinates
      const dist = res.distanceKm || estimatedDistanceKm || 3.5;
      const srcCoords = { lat: originLocation?.lat || 17.7214, lng: originLocation?.lng || 83.2929 };
      const rates = await getLiveTaxiRates(dist, originLocation?.city || "Visakhapatnam", originLocation?.name, destination, srcCoords, destCoords);
      setLiveRates(rates);
      setRefreshCountdown(12);
    } catch (err) {
      console.error("Fare check error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time 12-second live updates ticker
  useEffect(() => {
    if (!hasChecked || !destination || !destination.trim()) return;

    const interval = setInterval(async () => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          const dist = analysis?.distanceKm || estimatedDistanceKm || 3.5;
          const srcCoords = { lat: originLocation?.lat || 17.7214, lng: originLocation?.lng || 83.2929 };
          getLiveTaxiRates(dist, originLocation?.city || "Visakhapatnam", originLocation?.name, destination, srcCoords, destCoords).then(rates => {
            if (rates && rates.length > 0) setLiveRates(rates);
          });
          return 12;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasChecked, destination, destCoords, analysis, estimatedDistanceKm, originLocation]);

  // Deep links for Rapido and Uber with auto-filled origin and destination data
  const rideLinks = getRapidoAndUberUrls(
    originLocation?.name || "Current Location",
    destination,
    stops,
    { lat: originLocation?.lat || 17.7214, lng: originLocation?.lng || 83.2929 },
    destCoords
  );

  const [redirectNotice, setRedirectNotice] = useState(null);

  const handleBookRide = (provider, deepLink = null) => {
    const isUber = (provider || "").toLowerCase().includes('uber');
    const targetUrl = deepLink || (isUber ? rideLinks.uberUrl : rideLinks.rapidoUrl);

    // 1. Auto-copy clean destination name to clipboard so if the mobile app opens, user can instantly paste
    if (navigator.clipboard?.writeText && destination) {
      navigator.clipboard.writeText(destination);
    }

    setRedirectNotice({
      provider: provider || (isUber ? 'Uber' : 'Rapido'),
      destination: destination,
      pickup: originLocation?.name || "Current Location",
      url: targetUrl
    });

    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 4500);

    // 2. Open prefilled URL in external tab / mobile app
    window.open(targetUrl, '_blank');
  };

  const handleRedirectRapido = () => handleBookRide('Rapido', rideLinks.rapidoUrl);
  const handleRedirectUber = () => handleBookRide('Uber', rideLinks.uberUrl);

  const handleSubmitScamReport = () => {
    const updated = saveLocalScamReport({
      standName: scamStandName,
      tactic: scamTactic,
      quotedFare: Number(quotedFare) || 100,
      fairMin: analysis?.estimatedMinFare || 25,
      fairMax: analysis?.estimatedMaxFare || 35,
      vehicleReg: scamVehicleReg,
      destination: destination,
      lat: originLocation?.lat || 17.7214,
      lng: originLocation?.lng || 83.2929
    });

    if (onScamReported) {
      onScamReported(updated);
    }

    setShowScamModal(false);
    setReportSuccessToast(true);
    setTimeout(() => setReportSuccessToast(false), 3500);
  };

  const getRiskTheme = (level) => {
    switch (level) {
      case 'HIGH':
      case 'POTENTIALLY_UNFAIR':
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-700',
          badge: 'bg-red-600 text-white',
          glow: 'border-red-400 shadow-red-500/10',
          icon: ShieldAlert,
          title: t.highDeviationHeadline,
          barColor: 'bg-red-500'
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-800',
          badge: 'bg-amber-600 text-white',
          glow: 'border-amber-400 shadow-amber-500/10',
          icon: AlertTriangle,
          title: t.moderateDeviationHeadline,
          barColor: 'bg-amber-500'
        };
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800',
          badge: 'bg-emerald-600 text-white',
          glow: 'border-emerald-400 shadow-emerald-500/10',
          icon: ShieldCheck,
          title: t.fairPriceHeadline,
          barColor: 'bg-emerald-500'
        };
    }
  };

  const theme = getRiskTheme(analysis?.deviationLevel || 'HIGH');
  const RiskIcon = theme.icon;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden mb-8">
      
      {/* Toast alert for auto-filled destination and redirect */}
      {copiedToast && (
        <div className="bg-slate-950 text-white text-xs px-5 py-3 border-b-2 border-emerald-400 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                <span>🚀 Auto-Filled Destination:</span>
                <span className="text-emerald-300 font-extrabold underline">{destination}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Opening {redirectNotice?.provider || "Ride Provider"} with prefilled pickup &amp; dropoff coordinates. Destination is also auto-copied to clipboard!
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-400/30 shrink-0">
            Auto-Fill Active
          </span>
        </div>
      )}

      {/* Toast for Scam report */}
      {reportSuccessToast && (
        <div className="bg-rose-600 text-white text-xs px-4 py-2.5 text-center font-bold flex items-center justify-center gap-2 animate-in fade-in">
          <Flag className="h-4 w-4" />
          <span>Overcharge incident reported! Added to community risk heatmap on Google Maps.</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md ring-1 ring-white/20">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-md">
                Hero Protection
              </span>
              <span className="text-xs font-semibold text-rose-100">Anti-Deceptive Fare Checker</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t.checkBeforePay}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Driver QR Meter Modal Trigger */}
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20 transition-all"
          >
            <QrCode className="h-3.5 w-3.5" /> Driver QR Meter
          </button>

          {/* Student Pass Toggle */}
          <button
            onClick={() => setIsStudentVerified(!isStudentVerified)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
              isStudentVerified 
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm' 
                : 'bg-white/10 hover:bg-white/20 text-rose-100 border-white/20'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>{isStudentVerified ? "🎓 Student Pass (-50%)" : "Student Mode"}</span>
          </button>
        </div>
      </div>

      {/* Input Form Controls */}
      <div className="p-5 sm:p-6 bg-slate-50/50 border-b border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* DESTINATION INPUT WITH LIVE LOCATION-BASED SUGGESTIONS & AUTOCOMPLETE */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  🎯 {t.destinationLabel}
                </label>
                {estimatedDistanceKm && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg text-[10px] font-black border border-emerald-300 animate-in fade-in">
                    <Navigation className="h-2.5 w-2.5 text-emerald-700 animate-pulse" />
                    <span>{estimatedDistanceKm} km ({estimatedDurationMins}m)</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {destination && (
                  <button
                    type="button"
                    onClick={handleClearDestination}
                    className="text-[11px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-0.5"
                    title="Clear destination"
                  >
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowAddStop(!showAddStop)}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                  title="Add intermediate stop"
                >
                  <Plus className="h-3.5 w-3.5" /> Stop
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={destSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setDestSearch(val);
                  setDestination(val);
                  if (onDestinationChange) onDestinationChange(val, null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && destSearch && destSearch.trim()) {
                    e.preventDefault();
                    setDestPredictions([]);
                    handleCheckFare();
                  }
                }}
                placeholder={`Search destination in ${liveCity} or across India...`}
                className="w-full bg-white border border-slate-300 rounded-2xl pl-3.5 pr-14 py-2.5 text-xs font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                {destSearch && (
                  <button
                    type="button"
                    onClick={handleClearDestination}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Clear destination"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {searching && (
                  <Loader2 className="h-4 w-4 text-teal-600 animate-spin" />
                )}
              </div>
            </div>

            {/* LIVE LOCATION-AWARE POPULAR DESTINATIONS TRAY */}
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                  <span>Popular in <strong className="text-teal-700">{liveCity}</strong> (Click to auto-fill):</span>
                </span>
                <span className="text-[9px] text-slate-400 font-bold hidden sm:inline">
                  📍 Real-time live GPS distance
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {popularLiveDestinations.slice(0, 8).map((dest) => {
                  const isSelected = destination && (
                    destination.toLowerCase().includes(dest.name.toLowerCase()) || 
                    destination.toLowerCase().includes(dest.relativeName.toLowerCase())
                  );
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => handleSelectSuggestedDestination(dest)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border shadow-xs ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm scale-102'
                          : 'bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border-slate-200 hover:border-teal-300'
                      }`}
                      title={`${dest.relativeName} - ${dest.address}`}
                    >
                      <span className="text-xs">{dest.emoji}</span>
                      <span>{dest.name.split('(')[0].trim()}</span>
                      {dest.distanceKm !== null && (
                        <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded-md ${
                          isSelected ? 'bg-teal-700 text-teal-100' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {dest.distanceKm}km
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Autocomplete Predictions Dropdown */}
            {destPredictions.length > 0 && (
              <div className="absolute left-0 right-0 top-16 bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Relative Destinations matching "{destSearch}"</span>
                  <span>{destPredictions.length} results</span>
                </div>
                {destPredictions.map((p, idx) => (
                  <button
                    key={p.placeId || idx}
                    type="button"
                    onClick={() => handleSelectDestPrediction(p)}
                    className="w-full text-left p-3 hover:bg-teal-50 transition-colors flex items-start gap-2.5 text-xs group"
                  >
                    <span className="text-sm mt-0.5">{p.fullItem?.emoji || '📍'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <strong className="text-slate-900 font-bold group-hover:text-teal-900 truncate">
                          {p.mainText}
                        </strong>
                        {p.fullItem?.distanceKm !== undefined && p.fullItem?.distanceKm !== null && (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md shrink-0">
                            {p.fullItem.distanceKm} km away
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {p.secondaryText}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Stops list chips */}
            {stops && stops.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {stops.map((st, idx) => {
                  const sName = typeof st === 'string' ? st : (st?.name || `Stop ${idx + 1}`);
                  return (
                    <div key={idx} className="flex items-center justify-between bg-amber-50 border border-amber-200/90 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-900 shadow-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                        <span>Stop {idx + 1}: <strong className="text-amber-950">{sName}</strong></span>
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveStop(idx)} 
                        className="text-amber-700 hover:text-red-600 transition-colors p-0.5" 
                        title="Remove this stop"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Stop with Google Places Autocomplete */}
            {showAddStop && (
              <div className="mt-2 space-y-1.5 relative">
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search stop across India (e.g. RTC Complex, Sairam)..."
                      value={stopSearch}
                      onChange={(e) => setStopSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && stopSearch.trim() && handleAddStop(stopSearch.trim())}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-3 pr-7 py-1.5 text-xs font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {stopSearching && (
                      <Loader2 className="absolute right-2.5 top-2 h-3.5 w-3.5 text-amber-600 animate-spin" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => stopSearch.trim() && handleAddStop(stopSearch.trim())}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddStop(false); setStopSearch(""); setStopPredictions([]); }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-1.5"
                  >
                    Cancel
                  </button>
                </div>

                {/* Autocomplete Predictions for intermediate stop */}
                {stopPredictions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-40 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {stopPredictions.map((p) => (
                      <button
                        key={p.placeId}
                        type="button"
                        onClick={async () => {
                          setStopSearching(true);
                          try {
                            const details = await getPlaceDetails(p.placeId);
                            handleAddStop({
                              name: details?.name || p.mainText,
                              lat: details?.lat,
                              lng: details?.lng,
                              address: details?.address
                            });
                          } catch {
                            handleAddStop(p.mainText);
                          } finally {
                            setStopSearching(false);
                          }
                        }}
                        className="w-full text-left p-2.5 hover:bg-amber-50 transition-colors flex items-start gap-2 text-xs"
                      >
                        <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold text-[11px]">{p.mainText}</strong>
                          <span className="text-[10px] text-slate-500">{p.secondaryText}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TRANSPORT TYPE */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              🛺 Vehicle Type
            </label>
            <select
              value={transportType}
              onChange={(e) => setTransportType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="AUTO">Auto Rickshaw (3-Wheeler)</option>
              <option value="CAB">Cab / Taxi (AC 4-Wheeler)</option>
              <option value="SHARED_CAB">Shared Auto / Shuttle</option>
              <option value="BUS">City Bus (APSRTC)</option>
            </select>
          </div>

          {/* QUOTED FARE */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              💰 Driver Quoted Fare (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">₹</span>
              <input
                type="number"
                value={quotedFare}
                onChange={(e) => setQuotedFare(e.target.value)}
                placeholder="100"
                className="w-full bg-white border border-slate-300 rounded-2xl pl-8 pr-3.5 py-2.5 text-xs font-extrabold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            {/* Quick Quote Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
              {['30', '50', '100', '150', '250'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setQuotedFare(chip)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                    quotedFare === chip
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  ₹{chip}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* REAL-WORLD DESTINATION SPOTLIGHT CARD WITH GOOGLE PHOTOS */}
        {destination && destination.trim().length > 1 && (
          <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-md flex flex-col sm:flex-row items-center gap-4 transition-all border border-slate-700">
            {/* Real Location Photo */}
            <div className="relative w-full sm:w-44 h-32 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-950 border border-white/20 group">
              <img
                src={
                  destinationPhoto ||
                  (popularLiveDestinations.find(d => 
                    destination.toLowerCase().includes(d.name.toLowerCase()) || 
                    destination.toLowerCase().includes(d.relativeName.toLowerCase())
                  )?.imageUrl) ||
                  "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800"
                }
                alt={destination}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
                }}
              />
              <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <span>📸 Location Photo</span>
              </div>
              {destRating && (
                <div className="absolute bottom-2 right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                  <span>★</span>
                  <span>{destRating}</span>
                </div>
              )}
            </div>

            {/* Destination Metadata & Direct Google Search / Photos links */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black text-teal-300 bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Target Destination
                </span>
                {estimatedDistanceKm && (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    📍 {estimatedDistanceKm} km route (~{estimatedDurationMins} mins)
                  </span>
                )}
              </div>

              <h4 className="text-base sm:text-lg font-black text-white mt-1 truncate">
                {destination}
              </h4>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                {destAddress || `${destination}, ${originLocation?.city || 'India'}`}
              </p>

              {/* Quick Links to Google Photos & Google Maps */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(destination + ' ' + (originLocation?.city || ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-xl transition-all"
                  title="View all photos of this place on Google Image Search"
                >
                  <span>🖼️ View Photos on Google</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-300 hover:text-sky-200 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-xl transition-all"
                  title="View location in Google Maps"
                >
                  <span>🗺️ Google Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Primary Submit & Calculate Button (Requirement 3) */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            {destination ? (
              <span className="text-slate-700">
                Destination: <strong className="text-slate-900">{destination}</strong>
                {estimatedDistanceKm && (
                  <span className="text-emerald-700 font-bold ml-1.5">• Shortest Route: {estimatedDistanceKm} km (~{estimatedDurationMins} mins)</span>
                )}
              </span>
            ) : (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                Please specify destination to check fares
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCheckFare}
            disabled={loading || !destination || !destination.trim()}
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>{loading ? "Verifying Live Rates..." : "🔍 Calculate & Compare Fares"}</span>
          </button>
        </div>

        {/* Complete Trip Journey Sequence Breadcrumb Banner */}
        {(destination || (stops && stops.length > 0)) && (
          <div className="mt-4 p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/90 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-black text-teal-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5 shrink-0">
              <Navigation className="h-3.5 w-3.5 text-teal-600" /> Trip Route:
            </span>
            
            {/* Origin */}
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Start:</span>
              <span className="max-w-[130px] truncate">{originLocation?.name || "Live GPS"}</span>
            </span>

            {/* Stops */}
            {stops && stops.map((st, idx) => {
              const sName = typeof st === 'string' ? st : (st?.name || `Stop ${idx + 1}`);
              return (
                <React.Fragment key={idx}>
                  <ArrowRight className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="inline-flex items-center gap-1.5 font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-xl border border-amber-300 shadow-xs shrink-0">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-black">{idx + 1}</span>
                    <span className="text-[10px] uppercase tracking-wider text-amber-700 font-extrabold">Stop {idx + 1}:</span>
                    <span className="max-w-[130px] truncate">{sName}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveStop(idx)} 
                      className="text-amber-700 hover:text-red-600 ml-0.5" 
                      title="Remove stop"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                </React.Fragment>
              );
            })}

            {/* Destination */}
            {destination && (
              <>
                <ArrowRight className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span className="inline-flex items-center gap-1.5 font-bold text-rose-900 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-300 shadow-xs shrink-0">
                  <span>🎯</span>
                  <span className="text-[10px] uppercase tracking-wider text-rose-700 font-extrabold">Destination:</span>
                  <span className="max-w-[150px] truncate">{destination}</span>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Analysis Result Banner & Live Rates */}
      {!hasChecked || !analysis || !destination || !destination.trim() ? (
        <div className="p-8 sm:p-12 text-center bg-slate-50/70 border-t border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3.5 border border-rose-200 shadow-sm">
            <MapPin className="h-7 w-7 text-rose-500" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Enter Destination to View Real-Time Fare Verification
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            Please specify where you want to go in the destination field above and click <strong className="text-slate-800">"Calculate & Compare Fares"</strong> to view fair government tariffs, live Rapido & Uber taxi rates, and shortest routes.
          </p>
        </div>
      ) : (
        <div className="p-5 sm:p-7">
          <div className={`rounded-3xl border-2 p-5 sm:p-6 mb-6 ${theme.bg} ${theme.glow}`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`p-3 rounded-2xl ${theme.badge} shrink-0 shadow-md`}>
                  <RiskIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${theme.badge}`}>
                      {analysis.deviationLevel} DEVIATION (+{analysis.deviationPercentage}%)
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      Regulated Rate: ₹{analysis.estimatedMinFare}–₹{analysis.estimatedMaxFare}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                    {theme.title}
                  </h3>

                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed max-w-2xl font-medium">
                    {analysis.advisoryMessage}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Recommendation:
                    </span>
                    <span className="text-xs text-teal-900 font-semibold bg-white/80 px-2.5 py-1 rounded-xl border border-teal-200/60 shadow-sm">
                      {analysis.recommendedAction}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Report Overcharge / Audio Readout / Tariff Breakdown */}
              <div className="flex flex-row sm:flex-col gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) {
                      speechService.stop();
                      setIsSpeaking(false);
                    } else {
                      setIsSpeaking(true);
                      const speechText = `${analysis.deviationHeadline}. Fair fare range is ${analysis.estimatedMinFare} to ${analysis.estimatedMaxFare} rupees. ${analysis.advisoryMessage}. ${analysis.recommendedAction}`;
                      speechService.speak(speechText, currentLang, () => setIsSpeaking(false));
                    }
                  }}
                  className={`flex items-center gap-1.5 font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95 ${
                    isSpeaking
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  title="Read out fare verification advice aloud"
                >
                  <span>{isSpeaking ? '⏹️ Stop Voice' : '🔊 Listen Advice'}</span>
                </button>

                {analysis.deviationPercentage > 30 && (
                  <button
                    onClick={() => setShowScamModal(true)}
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <Flag className="h-3.5 w-3.5" /> Report Scam
                  </button>
                )}
                
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-300 transition-all"
                >
                  <span>{showBreakdown ? "Hide Fare Formula" : "View Tariff Breakdown"}</span>
                  {showBreakdown ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Itemized Cost Breakdown */}
            {showBreakdown && analysis.costBreakdown && (
              <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {Object.entries(analysis.costBreakdown).map(([label, val]) => (
                  <div key={label} className="p-2.5 rounded-xl bg-white/70 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">{label}</span>
                    <span className="text-sm font-black text-slate-900">₹{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* REAL-TIME LIVE TAXI & AUTO RATES (RAPIDO & UBER LIVE AGGREGATOR - REQUIREMENT 1) */}
          <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white shadow-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Real-Time Live Sync</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Live updates in <strong className="text-amber-300 font-mono">{refreshCountdown}s</strong>
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white mt-1 flex items-center gap-2">
                  <span>⚡ Real-Time Taxi & Auto Rates (Rapido & Uber)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live dynamic pricing from Rapido & Uber with surge multiplier, ETA, and one-tap booking.
                </p>
              </div>

              {/* Filter tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                {["ALL", "BIKE_TAXI", "AUTO", "CAB"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setLiveRateCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      liveRateCategory === cat
                        ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                        : "bg-white/10 hover:bg-white/20 text-slate-300"
                    }`}
                  >
                    {cat === "ALL" ? "All Rides" : cat === "BIKE_TAXI" ? "🏍️ Bike" : cat === "AUTO" ? "🛺 Auto" : "🚗 Cab"}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Quotes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {liveRates
                .filter((q) => liveRateCategory === "ALL" || q.category === liveRateCategory)
                .map((quote, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/60 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          quote.provider === 'Rapido' 
                            ? 'bg-amber-400 text-slate-950' 
                            : quote.provider === 'Uber' 
                              ? 'bg-slate-950 text-white border border-white/30' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {quote.provider}
                        </span>
                        <span className="text-[10px] text-slate-300 flex items-center gap-1 font-semibold">
                          <Clock className="h-3 w-3 text-amber-400" /> ~{quote.etaMinutes} mins pickup
                        </span>
                      </div>

                      <h5 className="text-sm font-black text-white">{quote.vehicleName}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Base ₹{quote.baseFare} + ₹{quote.perKmRate}/km
                      </p>

                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-black text-amber-400 font-mono">
                          ₹{quote.estimatedFare}
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                          {quote.surgeLabel}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10">
                      {quote.deepLink ? (
                        <button
                          type="button"
                          onClick={() => handleBookRide(quote.provider, quote.deepLink)}
                          className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <span>Book on {quote.provider}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <span className="w-full text-center text-slate-400 font-bold text-xs py-2 block bg-white/5 rounded-xl border border-white/10">
                          Flag at Auto Stand (Meter)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* MULTI-PROVIDER COMPARISON MATRIX (STATUTORY TARIFF VERIFIED VS APP ESTIMATE) */}
          <div className="mb-6">
            <ProviderComparisonTable
              city={originLocation?.city || "Visakhapatnam"}
              origin={originLocation?.name || "Current Location"}
              destination={destination}
              distanceKm={analysis?.distanceKm || estimatedDistanceKm || 2.8}
              pickupCoords={originLocation}
              dropCoords={destCoords}
            />
          </div>

          {/* BUS TRANSIT GUIDE TRIGGER BANNER (REQUIREMENT 4) */}
          <div className="mb-6 p-4 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-xs">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-teal-950">
                  Prefer Public Bus? (APSRTC Stage Ticket: ₹10–₹15)
                </h4>
                <p className="text-[11px] text-teal-800">
                  Find walking directions to your nearest bus stop, bus route numbers, and timings.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowBusGuide(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto active:scale-95 cursor-pointer"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Directions to Nearest Bus Stop</span>
            </button>
          </div>

          {/* Cheaper Alternatives Comparison */}
          {analysis.alternatives && analysis.alternatives.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  ⚡ Transparent Transportation Alternatives
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRedirectRapido}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 transition-transform active:scale-95"
                  >
                    <span>Rapido</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleRedirectUber}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 transition-transform active:scale-95"
                  >
                    <span>Uber</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {analysis.alternatives.slice(0, 3).map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-500 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-slate-900">{alt.title}</span>
                        {alt.badge && (
                          <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                            {alt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">{alt.provider}</p>
                      <p className="text-base font-black text-slate-900">
                        ₹{isStudentVerified && alt.type === 'BUS' ? Math.round(alt.totalCost * 0.5) : alt.totalCost}
                        {isStudentVerified && alt.type === 'BUS' && (
                          <span className="text-[10px] text-emerald-600 font-bold ml-1.5">(50% Student Pass)</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1">{alt.whyChosen}</p>
                    </div>

                    <button
                      onClick={() => onSelectPlan && onSelectPlan(alt, destination)}
                      className="mt-3 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                    >
                      <span>Start Trip Mode</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Driver QR Meter Modal (Phase 6) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <QrCode className="h-6 w-6" />
            </div>
            <h3 className="font-black text-slate-900 text-base">Regulated Driver Fare Card</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Honest drivers display this QR code on their dashboard. Scan to verify government-gazetted meter tariff instantly.
            </p>

            {/* Visual Simulated QR Code */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-teal-300 inline-block mb-4">
              <div className="w-40 h-40 bg-slate-900 rounded-xl p-3 flex flex-col justify-between text-white text-[10px]">
                <div className="flex justify-between">
                  <span className="font-mono font-bold">■■■■■</span>
                  <span className="font-mono font-bold">■■■■■</span>
                </div>
                <div className="text-center font-bold text-teal-300">
                  TRIP PILOT VERIFIED METER
                  <br/>
                  <span className="text-white text-[9px]">Base ₹20 + ₹14/km</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono font-bold">■■■■■</span>
                  <span className="font-mono font-bold">■■■■■</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 font-semibold mb-4">
              Tariff Code: <strong>AP-VIZAG-MTR-2026</strong>
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full bg-teal-600 text-white font-bold text-xs py-2.5 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Report Scam / Overcharging Modal (Phase 3) */}
      {showScamModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <Flag className="h-5 w-5" />
              </div>
              <h3 className="font-black text-slate-900 text-base">Report Overcharge Hotspot</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Help fellow tourists and students! Your incident report updates the Community Scam Heatmap on Google Maps.
            </p>

            <div className="space-y-3 mb-5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Stand or Location Name</label>
                <input
                  type="text"
                  value={scamStandName}
                  onChange={(e) => setScamStandName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deceptive Tactic Observed</label>
                <select
                  value={scamTactic}
                  onChange={(e) => setScamTactic(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Meter Refusal & Unfair Quoted Fare">Meter Refusal (Flat Unfair Quote)</option>
                  <option value="Illegal Night Surcharge before 10 PM">Night Surge Demanded in Daylight</option>
                  <option value="Tourist Extortion / Luggage Fee">Unregulated Luggage Extortion</option>
                  <option value="Route Deviation to Inflate Price">Deliberate Longer Route</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Vehicle Reg No. (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. AP 31 TT 9281"
                  value={scamVehicleReg}
                  onChange={(e) => setScamVehicleReg(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                Quoted: <strong>₹{quotedFare}</strong> vs Fair: <strong>₹{analysis?.estimatedMinFare}–₹{analysis?.estimatedMaxFare}</strong> (+{analysis?.deviationPercentage}% Deviation)
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowScamModal(false)}
                className="px-4 py-2 text-xs text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitScamReport}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md"
              >
                Submit Incident Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bus Transit Directions to Nearest Stop Modal (Requirement 4) */}
      <BusTransitGuide
        isOpen={showBusGuide}
        onClose={() => setShowBusGuide(false)}
        originLocation={originLocation}
        destination={destination}
      />

    </div>
  );
}
