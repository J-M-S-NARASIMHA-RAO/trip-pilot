import React, { useState, useEffect } from 'react';
import { 
  Compass, MapPin, Clock, DollarSign, Sparkles, 
  ArrowRight, Heart, Star, Calendar, ExternalLink, Search, 
  Navigation, CheckCircle2, ShieldCheck, Wallet, SlidersHorizontal 
} from 'lucide-react';
import { translations } from '../translations';
import { getTouristPlaces, getBudgetItinerary } from '../api';

export default function ExploreWithMe({ currentLang, originLocation, onSelectAttraction }) {
  const t = translations[currentLang] || translations.en;
  
  // Requirement 6: Explore place based on 2 options:
  // Option 1: Current location
  // Option 2: Selective option (other city search)
  const [exploreMode, setExploreMode] = useState("CURRENT"); // "CURRENT" or "SELECTIVE"
  const [selectiveCity, setSelectiveCity] = useState("Hyderabad");
  const [customCityInput, setCustomCityInput] = useState("");
  
  // Custom Budget input
  const [itineraryBudget, setItineraryBudget] = useState(500);
  const [places, setPlaces] = useState([]);
  const [itineraryData, setItineraryData] = useState(null);
  const [loading, setLoading] = useState(false);

  const POPULAR_CITIES = [
    "Visakhapatnam", "Hyderabad", "Bengaluru", "Vijayawada", "Delhi", "Mumbai", "Srikakulam", "Jaipur"
  ];

  const activeCity = exploreMode === "CURRENT" 
    ? ((originLocation?.city && originLocation.city !== "Locating...") ? originLocation.city : "Visakhapatnam") 
    : (selectiveCity || "Visakhapatnam");

  const startingPoint = exploreMode === "CURRENT"
    ? (originLocation?.name || "Current GPS Location")
    : `${activeCity} Central Hub`;

  useEffect(() => {
    setLoading(true);
    // Fetch places for active city
    getTouristPlaces(activeCity).then(data => {
      setPlaces(data || []);
    });

    // Fetch budget itinerary
    getBudgetItinerary(startingPoint, 6, Number(itineraryBudget) || 500, activeCity)
      .then(data => {
        setItineraryData(data);
      })
      .finally(() => setLoading(false));
  }, [activeCity, itineraryBudget, startingPoint]);

  const handleApplyCustomCity = (e) => {
    e.preventDefault();
    if (customCityInput.trim()) {
      setSelectiveCity(customCityInput.trim());
      setCustomCityInput("");
    }
  };

  return (
    <div className="space-y-8 mb-8">
      
      {/* Hero Header with Exploration Mode & Budget Controls */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
              AI Smart City Explorer
            </span>
            <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">
              {exploreMode === "CURRENT" ? "📍 Current Location Mode" : `🔍 Remote City Mode: ${activeCity}`}
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
            🤖 Explore Sights in {activeCity}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            {exploreMode === "CURRENT"
              ? `You are in ${originLocation?.name || "Visakhapatnam"}. Discover curated landmarks, entry tickets, and budget itineraries tailored to your live location.`
              : `Browsing from ${originLocation?.city || "your place"} to explore ${activeCity}. Plan sights, public transit, and travel budget before you arrive.`}
          </p>

          {/* TWO EXPLORATION OPTIONS BAR (REQUIREMENT 6) */}
          <div className="mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Mode 1 vs Mode 2 Switcher */}
            <div className="flex items-center gap-1.5 p-1.5 bg-black/30 rounded-2xl border border-white/15">
              <button
                type="button"
                onClick={() => setExploreMode("CURRENT")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  exploreMode === "CURRENT"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Option 1: Current Location</span>
              </button>
              
              <button
                type="button"
                onClick={() => setExploreMode("SELECTIVE")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  exploreMode === "SELECTIVE"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                <span>Option 2: Other City</span>
              </button>
            </div>

            {/* Custom Budget Input */}
            <div className="flex items-center gap-2 bg-black/30 px-3.5 py-2 rounded-2xl border border-white/15">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <label className="text-xs font-bold text-slate-300">My Budget:</label>
              <span className="text-emerald-400 font-bold text-xs">₹</span>
              <input
                type="number"
                value={itineraryBudget}
                onChange={(e) => setItineraryBudget(e.target.value)}
                className="w-20 bg-white/10 text-white font-black text-sm px-2 py-1 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-center"
                placeholder="500"
              />
            </div>

          </div>

          {/* Selective Option: City Dropdown & Search Bar */}
          {exploreMode === "SELECTIVE" && (
            <div className="mt-4 p-3.5 rounded-2xl bg-black/40 border border-white/15 animate-in fade-in">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block mb-2">
                Select or Search Any Target City in India:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectiveCity(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectiveCity === c 
                        ? "bg-amber-400 text-slate-950 font-black shadow-sm" 
                        : "bg-white/10 hover:bg-white/20 text-slate-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <form onSubmit={handleApplyCustomCity} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or type other city name (e.g. Pune, Kochi, Chennai)..."
                  value={customCityInput}
                  onChange={(e) => setCustomCityInput(e.target.value)}
                  className="flex-1 bg-white/10 text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-semibold"
                />
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-4 py-1.5 rounded-xl transition-all shadow-sm"
                >
                  Explore City
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Dynamic Budget Optimizer Itinerary Feature */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                AI Budget Optimizer
              </span>
              <span className="text-xs font-bold text-slate-500">
                Starting from: <strong>{startingPoint}</strong>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              ₹{itineraryBudget} Full-Day Sightseeing Itinerary in {activeCity}
            </h3>
            <p className="text-xs text-slate-500">
              Optimized route balancing transit fares, entry tickets, and meals within your ₹{itineraryBudget} budget.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">Total Budget:</span>
            <span className="text-xl font-black text-teal-700 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200 font-mono">
              ₹{itineraryBudget}
            </span>
          </div>
        </div>

        {/* Quick Budget Preset Buttons */}
        <div className="my-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Quick Budgets:</span>
          {[300, 500, 800, 1200, 2000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setItineraryBudget(amt)}
              className={`px-3 py-1 rounded-xl font-bold border transition-all ${
                Number(itineraryBudget) === amt
                  ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        {/* Step-by-Step Schedule */}
        <div className="mt-4 space-y-3">
          {itineraryData?.stops && itineraryData.stops.map((stop, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                stop.category === 'START' || stop.category === 'END'
                  ? 'bg-slate-50 border-slate-200'
                  : stop.category === 'FOOD'
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-teal-50/50 border-teal-200'
              }`}
            >
              <span className="text-xs font-extrabold text-slate-500 min-w-[70px] pt-0.5 font-mono">
                {stop.time}
              </span>
              <div className="flex-1">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  {stop.category === 'FOOD' && <span>🍽️</span>}
                  {stop.category === 'START' && <span>🚀</span>}
                  {stop.category === 'END' && <span>🏠</span>}
                  {stop.place}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  {stop.activity}
                </p>
              </div>
              <div className="text-right shrink-0">
                {stop.entryFee > 0 && (
                  <span className="text-xs font-bold text-teal-800 bg-white px-2 py-0.5 rounded-lg border border-teal-200 block mb-1">
                    Entry ₹{stop.entryFee}
                  </span>
                )}
                {stop.transportCost > 0 && (
                  <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200 block">
                    Transit ₹{stop.transportCost}
                  </span>
                )}
                {stop.foodCost > 0 && (
                  <span className="text-xs font-bold text-amber-800 bg-white px-2 py-0.5 rounded-lg border border-amber-200 block">
                    Food ₹{stop.foodCost}
                  </span>
                )}
                {(!stop.entryFee && !stop.transportCost && !stop.foodCost) && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 block">
                    Free
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Budget Breakdown Summary */}
        {itineraryData?.costSummary && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Transportation</span>
                <span className="font-black text-emerald-950 font-mono">₹{itineraryData.costSummary.transportation}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Food</span>
                <span className="font-black text-emerald-950 font-mono">₹{itineraryData.costSummary.food}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Entry Fees</span>
                <span className="font-black text-emerald-950 font-mono">₹{itineraryData.costSummary.entryFees}</span>
              </div>
              <div className="border-l border-emerald-300 pl-4">
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Total Spent</span>
                <span className="font-black text-emerald-950 font-mono">₹{itineraryData.costSummary.grandTotal}</span>
              </div>
            </div>

            <div className="bg-white px-3.5 py-2 rounded-xl border border-emerald-300 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Remaining Savings</span>
              <span className="text-sm font-black text-emerald-700 font-mono">
                ₹{itineraryData.costSummary.savingsRemaining} (Under Budget!)
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Featured Attractions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Featured {activeCity} Attractions
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Showing {places.length} top spots
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {places.map((place) => (
            <div
              key={place.id || place.name}
              className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={place.imageUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"}
                    alt={place.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                    {place.category}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                    {place.entryFee > 0 ? `Entry: ₹${place.entryFee}` : 'Free Entry'}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="text-base font-black text-slate-900">{place.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {place.description}
                  </p>
                  
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3 text-slate-400" /> {place.estimatedVisitTimeMin || 60} mins visit
                    </span>
                    <span className="font-semibold text-teal-700">
                      {place.bestTime || "All Day"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => onSelectAttraction && onSelectAttraction(place.name)}
                  className="w-full bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-800 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  Plan Ride to Here <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}