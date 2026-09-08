import React, { useState, useEffect } from 'react';
import { 
  Bus, Car, Footprints, Users, Wallet, Clock, ArrowRight, 
  Sparkles, CheckCircle2, ShieldCheck, Zap, Info, ChevronRight, 
  Plus, Trash2, ExternalLink, MapPin, Loader2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { translations } from '../translations';
import { planTrip, getRapidoAndUberUrls } from '../api';
import { searchPlaces, getPlaceDetails } from '../services/googleMapsService';
import { getLocationPhoto } from '../services/locationPhotoService';

export default function SmartMobilityPlanner({ currentLang, originLocation, userMode, onStartTrip }) {
  const t = translations[currentLang] || translations.en;

  // Custom user-typed destination
  const [destination, setDestination] = useState("Vizag Complex");
  const [destSearch, setDestSearch] = useState("");
  const [destPredictions, setDestPredictions] = useState([]);
  const [searchingDest, setSearchingDest] = useState(false);
  const [destPhoto, setDestPhoto] = useState(null);

  // Multi-stop support (Requirement 3: like Rapido)
  const [stops, setStops] = useState([]);
  const [newStopInput, setNewStopInput] = useState("");
  const [showAddStop, setShowAddStop] = useState(false);

  // Auto-fetch photo of destination
  useEffect(() => {
    if (!destination || destination.trim().length < 2) {
      setDestPhoto(null);
      return;
    }
    let isMounted = true;
    getLocationPhoto(destination, null, originLocation?.city || "").then(photoUrl => {
      if (isMounted && photoUrl) setDestPhoto(photoUrl);
    });
    return () => { isMounted = false; };
  }, [destination, originLocation]);

  // Autocomplete debounced search
  useEffect(() => {
    if (!destSearch || destSearch.trim().length < 2) {
      setDestPredictions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingDest(true);
      try {
        const results = await searchPlaces(destSearch, {
          lat: originLocation?.lat || 17.7214,
          lng: originLocation?.lng || 83.2929
        });
        setDestPredictions(results);
      } catch (err) {
        setDestPredictions([]);
      } finally {
        setSearchingDest(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [destSearch, originLocation]);

  const handleSelectPrediction = async (p) => {
    setSearchingDest(true);
    try {
      const details = await getPlaceDetails(p.placeId);
      if (details) {
        setDestination(details.name);
        if (details.photoUrl) setDestPhoto(details.photoUrl);
      } else {
        setDestination(p.mainText);
      }
      setDestSearch("");
      setDestPredictions([]);
    } catch (e) {
      setDestination(p.mainText);
      setDestPredictions([]);
    } finally {
      setSearchingDest(false);
    }
  };

  const [travelers, setTravelers] = useState(1);
  // Clean budget handling (Requirement 5: remove unnecessary 0)
  const [budget, setBudget] = useState(100);
  const [preferredTransport, setPreferredTransport] = useState("ANY");
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [expandedWhy, setExpandedWhy] = useState(null);

  const handleAddStop = () => {
    if (!newStopInput.trim()) return;
    setStops([...stops, newStopInput.trim()]);
    setNewStopInput("");
    setShowAddStop(false);
  };

  const handleRemoveStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const triggerPlan = async () => {
    setLoading(true);
    try {
      const res = await planTrip({
        source: originLocation?.name || "Visakhapatnam Railway Station",
        destination: destination || "Vizag Complex",
        stops: stops,
        travelers: Number(travelers) || 1,
        budget: budget === '' ? 500 : Number(budget),
        userMode: userMode,
        preferredTransport: preferredTransport
      });
      setPlanData(res);
      if (userMode === 'STUDENT' || (budget && budget <= 30)) {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      console.error("Trip planning error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    triggerPlan();
  }, [destination, stops, travelers, budget, userMode]);

  const [plannerToast, setPlannerToast] = useState(false);

  // Deep links for Rapido and Uber with auto-filled destination & coordinates
  const rideLinks = getRapidoAndUberUrls(
    originLocation?.name || "Current Location",
    destination,
    stops,
    { lat: originLocation?.lat || 17.7214, lng: originLocation?.lng || 83.2929 },
    null
  );

  const handleRedirectProvider = (provider, url) => {
    if (navigator.clipboard?.writeText && destination) {
      navigator.clipboard.writeText(destination);
    }
    setPlannerToast(true);
    setTimeout(() => setPlannerToast(false), 4500);
    window.open(url, '_blank');
  };

  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'CHEAPEST':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '💰', title: t.cheapest };
      case 'BEST_OVERALL':
        return { bg: 'bg-teal-100 text-teal-800 border-teal-300', icon: '⭐', title: t.bestOverall };
      case 'FASTEST':
        return { bg: 'bg-sky-100 text-sky-800 border-sky-300', icon: '⚡', title: t.fastest };
      case 'SAFEST':
        return { bg: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: '🛡️', title: t.safest };
      default:
        return { bg: 'bg-slate-100 text-slate-700 border-slate-300', icon: '✨', title: 'Value Option' };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-5 sm:p-7 mb-8 relative overflow-hidden">
      
      {/* Toast alert for destination auto-fill */}
      {plannerToast && (
        <div className="mb-4 bg-slate-950 text-white text-xs px-4 py-3 rounded-2xl border-b-2 border-emerald-400 shadow-xl flex items-center justify-between gap-2 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              🚀 Auto-filled &amp; copied: <strong className="underline text-emerald-300">{destination}</strong>. Opening ride provider...
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-md">
            Auto-Fill Active
          </span>
        </div>
      )}

      {/* Title & Mode Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
            Multi-Modal Mobility
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            🚍 Smart Mobility Planner
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan single or multi-stop rides, compare fair prices, or book directly on Rapido / Uber.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
            userMode === 'STUDENT' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {userMode === 'STUDENT' ? '🎓 Student Saver Mode Active' : '🗺️ Tourist Mode Active'}
          </span>
        </div>
      </div>

      {/* Planner Parameters Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
        
        {/* USER-CONTROLLED REAL-WORLD DESTINATION INPUT WITH AUTOCOMPLETE & PHOTO */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <span>🎯 Destination</span>
              {destPhoto && (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black">
                  📸 Photo Loaded
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={() => setShowAddStop(!showAddStop)}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
              title="Add intermediate stops like Rapido"
            >
              <Plus className="h-3 w-3" /> Add Stop
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Real photo thumbnail preview */}
            {destPhoto && (
              <img
                src={destPhoto}
                alt={destination}
                className="w-8 h-8 rounded-lg object-cover border border-teal-300 shrink-0 shadow-xs"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="relative flex-1">
              <input
                type="text"
                value={destSearch || destination}
                onChange={(e) => {
                  setDestSearch(e.target.value);
                  setDestination(e.target.value);
                }}
                placeholder="Search any destination worldwide..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              {searchingDest && (
                <Loader2 className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-teal-600 animate-spin" />
              )}
            </div>
          </div>

          {/* Autocomplete Predictions Dropdown */}
          {destPredictions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-40 overflow-hidden divide-y divide-slate-100 max-h-52 overflow-y-auto">
              {destPredictions.map((p) => (
                <button
                  key={p.placeId}
                  type="button"
                  onClick={() => handleSelectPrediction(p)}
                  className="w-full text-left p-2.5 hover:bg-teal-50 transition-colors flex items-start gap-2 text-xs"
                >
                  <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold text-xs">{p.mainText}</strong>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{p.secondaryText}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Stops List (Requirement 3: Multi-stop rides) */}
          {stops.length > 0 && (
            <div className="mt-2 space-y-1">
              {stops.map((st, idx) => (
                <div key={idx} className="flex items-center justify-between bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-teal-900">
                  <span>Stop {idx + 1}: {st}</span>
                  <button onClick={() => handleRemoveStop(idx)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Inline Add Stop input */}
          {showAddStop && (
            <div className="mt-2 p-2 rounded-xl bg-white border border-teal-300 flex items-center gap-1.5 shadow-xs">
              <input
                type="text"
                value={newStopInput}
                onChange={(e) => setNewStopInput(e.target.value)}
                placeholder="Intermediate stop..."
                className="flex-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddStop}
                className="bg-teal-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Travelers Stepper */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            👥 {t.travelers}
          </label>
          <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden p-0.5">
            <button
              onClick={() => setTravelers(Math.max(1, travelers - 1))}
              className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
            >
              -
            </button>
            <span className="flex-1 text-center text-xs font-bold text-slate-900">
              {travelers} {travelers === 1 ? 'person' : 'people'}
            </span>
            <button
              onClick={() => setTravelers(Math.min(6, travelers + 1))}
              className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* CLEAN BUDGET INPUT (Requirement 5: Removed unnecessary sticky 0) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            💰 {t.yourBudget}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
            <input
              type="number"
              value={budget === '' || budget === 0 ? '' : budget}
              onChange={(e) => {
                const val = e.target.value;
                setBudget(val === '' ? '' : Number(val));
              }}
              placeholder="Enter budget (e.g. 150)"
              className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <button
            onClick={triggerPlan}
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Optimizing..." : t.findTravelPlan}
          </button>
        </div>

      </div>

      {/* Multi-stop Notice Banner */}
      {planData?.multiStopNotice && (
        <div className="mb-4 p-3 rounded-2xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-900 flex items-center gap-2">
          <span>{planData.multiStopNotice}</span>
        </div>
      )}

      {/* Group Travel Notice Banner */}
      {planData?.groupSavingsNotice && (
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-2">
          <span>{planData.groupSavingsNotice}</span>
        </div>
      )}

      {/* Comparison Options Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Available Transportation Options ({planData?.allOptions?.length || 0})
          </h3>
          <span className="text-[11px] text-slate-500">Sorted by Smart Recommendation Algorithm</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {planData?.allOptions?.map((opt, idx) => {
            const badgeStyle = getBadgeStyle(opt.badge);
            const currentBudgetNum = budget === '' ? 500 : Number(budget);
            const isWithinBudget = opt.totalCost <= currentBudgetNum;

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  opt.badge === 'BEST_OVERALL'
                    ? 'border-teal-400 bg-teal-50/20 ring-2 ring-teal-500/20 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  
                  {/* Top Bar: Icon, Title & Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-100 text-lg">
                        {opt.type === 'BUS' ? '🚌' : opt.type === 'CAB' ? '🚕' : opt.type === 'AUTO' ? '🛺' : opt.type === 'SHARED_CAB' ? '🚐' : '🚶'}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{opt.title}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">{opt.provider}</p>
                      </div>
                    </div>

                    {opt.badge && (
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${badgeStyle.bg}`}>
                        {badgeStyle.icon} {badgeStyle.title}
                      </span>
                    )}
                  </div>

                  {/* Price & Duration */}
                  <div className="flex items-baseline justify-between py-2.5 my-2 border-y border-slate-100">
                    <div>
                      <span className="text-xl font-black text-slate-900">₹{Math.round(opt.totalCost)}</span>
                      {travelers > 1 && (
                        <span className="text-[11px] text-slate-500 ml-1">
                          (₹{Math.round(opt.costPerPerson)}/head)
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {opt.durationMinutes} mins
                      </span>
                      <span className="text-[10px] text-slate-400">Est. travel time</span>
                    </div>
                  </div>

                  {/* Steps summary */}
                  <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                    {opt.stepsSummary}
                  </p>

                  {/* Explainability toggle */}
                  <div className="text-[11px]">
                    <button
                      onClick={() => setExpandedWhy(expandedWhy === idx ? null : idx)}
                      className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3 text-teal-600" />
                      {t.whyDidTripPilotChooseThis}
                    </button>
                    {expandedWhy === idx && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] leading-relaxed border border-slate-200">
                        {opt.whyChosen}
                      </div>
                    )}
                  </div>

                </div>

                {/* Bottom CTA with RAPIDO / UBER REDIRECT (Requirement 1) */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isWithinBudget ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isWithinBudget ? '✓ Within Budget' : '⚠️ Exceeds Budget'}
                    </span>

                    <button
                      onClick={() => onStartTrip && onStartTrip(opt, destination)}
                      className="bg-slate-900 hover:bg-teal-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 active:scale-95"
                    >
                      Take This <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Direct Provider Redirect Options */}
                  {opt.type === 'AUTO' && (
                    <button
                      type="button"
                      onClick={() => handleRedirectProvider('Rapido', rideLinks.rapidoUrl)}
                      className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-[11px] py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <span>🛵 {t.bookOnRapido}</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}

                  {opt.type === 'CAB' && (
                    <button
                      type="button"
                      onClick={() => handleRedirectProvider('Uber', rideLinks.uberUrl)}
                      className="w-full bg-black hover:bg-slate-800 text-white font-bold text-[11px] py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <span>🚗 {t.bookOnUber}</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}