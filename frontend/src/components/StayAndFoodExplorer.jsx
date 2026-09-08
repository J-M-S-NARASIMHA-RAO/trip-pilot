import React, { useState, useEffect } from 'react';
import { 
  Bed, Utensils, ExternalLink, ShieldCheck, MapPin, 
  Train, Star, Sparkles, Filter, Search, ArrowUpRight,
  Coffee, Check, Sliders, Clock, Tag, ChevronDown
} from 'lucide-react';
import { getAccommodations, getRegionalFoods } from '../api';

export default function StayAndFoodExplorer({ currentCity = 'Visakhapatnam' }) {
  const [activeTab, setActiveTab] = useState('stays'); // 'stays' | 'food'
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Visakhapatnam');
  const [customCityInput, setCustomCityInput] = useState('');
  const [stays, setStays] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maxStayBudget, setMaxStayBudget] = useState(1500);
  const [maxFoodBudget, setMaxFoodBudget] = useState(150);
  const [filterWithFoodOnly, setFilterWithFoodOnly] = useState(false);

  // Dynamic user-selected options per stay: { [stayId]: { roomType, mealPlan, duration } }
  const [stayConfigs, setStayConfigs] = useState({});

  // Dynamic user-selected portion per food: { [foodId]: 'half' | 'regular' | 'combo' }
  const [foodConfigs, setFoodConfigs] = useState({});

  useEffect(() => {
    if (currentCity && currentCity !== "Detecting City..." && currentCity !== "Current Location") {
      setSelectedCity(currentCity);
    }
  }, [currentCity]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        if (activeTab === 'stays') {
          const res = await getAccommodations(selectedCity, null, maxStayBudget);
          if (isMounted) setStays(res || []);
        } else {
          const res = await getRegionalFoods(selectedCity, maxFoodBudget, false);
          if (isMounted) setFoods(res || []);
        }
      } catch (err) {
        console.error('Error loading explorer data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [activeTab, selectedCity, maxStayBudget, maxFoodBudget]);

  const popularCities = [
    'Visakhapatnam', 'Bengaluru', 'Hyderabad', 'Delhi', 'Mumbai', 'Vijayawada', 'Jaipur', 'Goa'
  ];

  const handleCustomCitySubmit = (e) => {
    e.preventDefault();
    if (customCityInput.trim()) {
      setSelectedCity(customCityInput.trim());
      setCustomCityInput('');
    }
  };

  const handleOpenOfficialLink = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Helper for dynamic stay configurations
  const getStayConfig = (stayId) => {
    return stayConfigs[stayId] || { roomType: 'standard', mealPlan: 'none', duration: '24h' };
  };

  const updateStayConfig = (stayId, key, value) => {
    setStayConfigs((prev) => {
      const current = prev[stayId] || { roomType: 'standard', mealPlan: 'none', duration: '24h' };
      return {
        ...prev,
        [stayId]: {
          ...current,
          [key]: value
        }
      };
    });
  };

  // Calculate dynamic price based on user-chosen money & food options
  const calculateDynamicPrice = (stay) => {
    const config = getStayConfig(stay.id);
    const basePrice = stay.pricePerNight || 250;

    // Room multiplier
    let roomMultiplier = 1.0;
    if (config.roomType === 'non_ac') roomMultiplier = 0.85;
    if (config.roomType === 'executive') roomMultiplier = 1.35;

    // Duration multiplier
    let durationMultiplier = 1.0;
    if (config.duration === '12h') durationMultiplier = 0.65;
    if (config.duration === '48h') durationMultiplier = 1.80; // 10% discount on 2 nights

    // Food add-on pricing options
    let mealCost = 0;
    let mealLabel = 'No Meals';
    if (config.mealPlan === 'breakfast') {
      mealCost = 49;
      mealLabel = 'Breakfast Included';
    } else if (config.mealPlan === 'all_meals') {
      mealCost = 129;
      mealLabel = '3 Meals Included';
    }

    const bedCost = Math.round(basePrice * roomMultiplier * durationMultiplier);
    const grandTotal = bedCost + mealCost;

    let durationLabel = '/ night';
    if (config.duration === '12h') durationLabel = '/ 12 hrs';
    if (config.duration === '48h') durationLabel = '/ 2 nights';

    return {
      grandTotal,
      bedCost,
      mealCost,
      mealLabel,
      durationLabel,
      roomType: config.roomType,
      mealPlan: config.mealPlan,
      duration: config.duration
    };
  };

  // Calculate dynamic price for food items based on portion options
  const calculateFoodPrice = (food) => {
    const portion = foodConfigs[food.id] || 'regular';
    const base = food.typicalPrice || 50;
    if (portion === 'half') {
      return { price: Math.round(base * 0.65), label: 'Half Plate / Mini', tag: 'Light Bite' };
    }
    if (portion === 'combo') {
      return { price: Math.round(base * 1.5), label: 'Unlimited / Special Combo', tag: 'With Drink & Dessert' };
    }
    return { price: base, label: 'Full Plate Standard', tag: 'Regular Portion' };
  };

  const updateFoodPortion = (foodId, portion) => {
    setFoodConfigs((prev) => ({
      ...prev,
      [foodId]: portion
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-lg">
              {activeTab === 'stays' ? '🛏️' : '🍲'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-100 text-lg sm:text-xl tracking-tight">
                  {activeTab === 'stays' 
                    ? `Backpacker Stays & Dorms in ${selectedCity}` 
                    : `Regional Food & Budget Radar in ${selectedCity}`}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ⚡ Dynamic Pricing Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTab === 'stays'
                  ? 'Customize your stay dynamically with room tiers, duration, and meal packages'
                  : 'Select portion sizes, mini meals, or full student combos with dynamic budget options'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 shadow-inner">
          <button
            onClick={() => setActiveTab('stays')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'stays'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bed className="h-3.5 w-3.5" />
            <span>Hostels & Dorms</span>
          </button>
          <button
            onClick={() => setActiveTab('food')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'food'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="h-3.5 w-3.5" />
            <span>Regional Food</span>
          </button>
        </div>
      </div>

      {/* Filter Row: City Selector + Search & Budget Filters */}
      <div className="relative z-10 flex flex-col gap-3.5 mb-6 bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
        
        {/* Top Filter Line: City & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-indigo-400" /> City:
            </span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-900 text-slate-100 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 shadow-sm"
            >
              {popularCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Quick city search */}
            <form onSubmit={handleCustomCitySubmit} className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Or type any city..."
                value={customCityInput}
                onChange={(e) => setCustomCityInput(e.target.value)}
                className="bg-slate-900/90 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl border border-slate-700/80 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-32 sm:w-40"
              />
              <button
                type="submit"
                className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1.5 rounded-xl text-xs font-semibold"
              >
                Go
              </button>
            </form>
          </div>

          {/* Food Filter Toggle */}
          {activeTab === 'stays' && (
            <button
              onClick={() => setFilterWithFoodOnly(!filterWithFoodOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                filterWithFoodOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Coffee className="h-3.5 w-3.5 text-amber-400" />
              <span>{filterWithFoodOnly ? 'Showing Stays with Food Packages' : 'Filter: Food Packages Available'}</span>
            </button>
          )}
        </div>

        {/* Bottom Filter Line: Dynamic Budget Slider & Quick Presets */}
        <div className="pt-3 border-t border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Dynamic Budget Slider */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" /> Max Budget:
            </span>
            <input
              type="range"
              min={activeTab === 'stays' ? 150 : 20}
              max={activeTab === 'stays' ? 2000 : 250}
              step={activeTab === 'stays' ? 50 : 10}
              value={activeTab === 'stays' ? maxStayBudget : maxFoodBudget}
              onChange={(e) => {
                if (activeTab === 'stays') setMaxStayBudget(Number(e.target.value));
                else setMaxFoodBudget(Number(e.target.value));
              }}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <span className="text-xs font-mono font-black text-emerald-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 shrink-0">
              ≤ ₹{activeTab === 'stays' ? maxStayBudget : maxFoodBudget}
            </span>
          </div>

          {/* Quick Money Filter Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Quick:</span>
            {(activeTab === 'stays' 
              ? [
                  { label: '≤ ₹250', val: 250, desc: 'Ultra Saver' },
                  { label: '≤ ₹400', val: 400, desc: 'Student' },
                  { label: '≤ ₹700', val: 700, desc: 'Comfort' },
                  { label: '≤ ₹1200', val: 1200, desc: 'Pods' },
                  { label: '≤ ₹2000', val: 2000, desc: 'All' }
                ]
              : [
                  { label: '≤ ₹40', val: 40, desc: 'Tea & Snack' },
                  { label: '≤ ₹70', val: 70, desc: 'Quick Meal' },
                  { label: '≤ ₹120', val: 120, desc: 'Full Thali' },
                  { label: '≤ ₹200', val: 200, desc: 'Special' }
                ]
            ).map((b) => (
              <button
                key={b.val}
                onClick={() => {
                  if (activeTab === 'stays') setMaxStayBudget(b.val);
                  else setMaxFoodBudget(b.val);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                  (activeTab === 'stays' ? maxStayBudget : maxFoodBudget) === b.val
                    ? (activeTab === 'stays' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-amber-600 text-white shadow-md shadow-amber-600/30')
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
                title={b.desc}
              >
                {b.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400">
          <div className="w-9 h-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-xs font-bold">Finding verified budget stays in {selectedCity}...</span>
        </div>
      ) : activeTab === 'stays' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stays.length > 0 ? (
            stays.map((stay) => {
              const pricing = calculateDynamicPrice(stay);
              const config = getStayConfig(stay.id);

              return (
                <div
                  key={stay.id}
                  className="group bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden hover:border-indigo-500/80 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all flex flex-col justify-between"
                >
                  {/* Photo & Dynamic Price Banner */}
                  <div className="relative h-44 bg-slate-950 overflow-hidden">
                    <img
                      src={stay.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'}
                      alt={stay.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'; }}
                    />
                    
                    {/* Official Authority Badge */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-950/85 backdrop-blur-md text-indigo-300 border border-indigo-500/40 shadow-sm flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-indigo-400" />
                        <span>{stay.badge || stay.type}</span>
                      </span>

                      {/* Dynamic Meal Included Indicator Badge */}
                      {pricing.mealCost > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide bg-amber-500/90 text-slate-950 shadow-md flex items-center gap-1 animate-in fade-in">
                          <Coffee className="h-2.5 w-2.5" />
                          <span>{pricing.mealLabel}</span>
                        </span>
                      )}
                    </div>

                    {/* Dynamic Real-time Recalculated Price Tag */}
                    <div className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-xl text-right bg-slate-950/95 backdrop-blur-md border border-emerald-500/40 shadow-xl">
                      <div className="text-sm font-black text-emerald-400 leading-tight">
                        ₹{pricing.grandTotal} <span className="text-[10px] text-slate-400 font-normal">{pricing.durationLabel}</span>
                      </div>
                      {pricing.mealCost > 0 && (
                        <div className="text-[9px] text-amber-300 font-semibold mt-0.5">
                          (Bed: ₹{pricing.bedCost} + Food: ₹{pricing.mealCost})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                    <div>
                      <h4 className="font-black text-slate-100 text-sm group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {stay.name}
                      </h4>
                      
                      <p className="text-[11px] text-slate-400 mt-1 flex items-start gap-1 line-clamp-1">
                        <MapPin className="h-3 w-3 text-slate-500 shrink-0 mt-0.5" />
                        <span>{stay.address}</span>
                      </p>

                      {stay.nearHub && (
                        <p className="text-[11px] text-indigo-300/90 font-semibold mt-1 flex items-center gap-1">
                          <Train className="h-3 w-3 text-indigo-400 shrink-0" />
                          <span>Near {stay.nearHub}</span>
                        </p>
                      )}
                    </div>

                    {/* DYNAMIC OPTION 1: ROOM / BED CATEGORY SELECTOR */}
                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>🛏️ Select Bed Tier:</span>
                        <span className="text-indigo-300 lowercase">{config.roomType}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'non_ac', label: 'Non-AC', sub: 'Saver' },
                          { id: 'standard', label: 'AC Bunk', sub: 'Standard' },
                          { id: 'executive', label: 'Exec Pod', sub: 'Premium' }
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => updateStayConfig(stay.id, 'roomType', r.id)}
                            className={`p-1.5 rounded-lg text-center transition-all text-[10px] font-bold ${
                              config.roomType === r.id
                                ? 'bg-indigo-600 text-white shadow-xs border border-indigo-400'
                                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                            }`}
                          >
                            <div className="font-black leading-tight">{r.label}</div>
                            <div className="text-[9px] opacity-75">{r.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DYNAMIC OPTION 2: FOOD & MEAL PACKAGE ADD-ON */}
                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-900/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Coffee className="h-3 w-3 text-amber-400" /> Food & Meal Add-on:
                        </span>
                        <span className="text-emerald-400 font-mono">
                          {config.mealPlan === 'none' ? '+₹0' : (config.mealPlan === 'breakfast' ? '+₹49' : '+₹129')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'none', label: 'Bed Only', sub: '+₹0' },
                          { id: 'breakfast', label: '+Breakfast', sub: '+₹49' },
                          { id: 'all_meals', label: '+3 Meals', sub: '+₹129' }
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => updateStayConfig(stay.id, 'mealPlan', m.id)}
                            className={`p-1.5 rounded-lg text-center transition-all text-[10px] font-bold ${
                              config.mealPlan === m.id
                                ? 'bg-amber-600 text-white shadow-xs border border-amber-400'
                                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                            }`}
                          >
                            <div className="font-black leading-tight">{m.label}</div>
                            <div className="text-[9px] opacity-80">{m.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DYNAMIC OPTION 3: STAY DURATION */}
                    <div className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800 text-[10px]">
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" /> Duration:
                      </span>
                      <div className="flex gap-1">
                        {[
                          { id: '12h', label: '12h' },
                          { id: '24h', label: '1 Night' },
                          { id: '48h', label: '2 Nights (-10%)' }
                        ].map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => updateStayConfig(stay.id, 'duration', d.id)}
                            className={`px-2 py-0.5 rounded-md font-bold transition-all text-[9px] ${
                              config.duration === d.id
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rating & Official Redirection CTA */}
                    <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-black">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{stay.rating}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({stay.reviewCount})</span>
                      </div>

                      <a
                        href={stay.bookingUrl || 'https://www.irctctourism.com/retiringroom'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <span>Book ₹{pricing.grandTotal}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 px-4 text-center bg-slate-800/30 rounded-2xl border border-slate-800">
              <p className="text-slate-300 font-bold text-sm">
                No stays found under ₹{maxStayBudget} in {selectedCity}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Try sliding the budget higher or selecting fewer meal add-ons.
              </p>
              <button
                onClick={() => setMaxStayBudget(2000)}
                className="mt-3.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                Reset to All Stays (≤ ₹2000)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Regional Food Grid with Dynamic Portions & Combos */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.length > 0 ? (
            foods.map((food) => {
              const portionPricing = calculateFoodPrice(food);
              const currentPortion = foodConfigs[food.id] || 'regular';

              return (
                <div
                  key={food.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden hover:border-amber-500/80 transition-all flex flex-col justify-between"
                >
                  <div className="relative h-44 bg-slate-950 overflow-hidden">
                    <img
                      src={food.imageUrl || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800'}
                      alt={food.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800'; }}
                    />
                    <div className="absolute top-2.5 left-2.5 flex gap-1">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-500/40">
                        {food.cuisine}
                      </span>
                    </div>

                    {/* Dynamic Food Price Tag */}
                    <div className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-xl text-right bg-slate-950/90 backdrop-blur-md border border-emerald-500/30 shadow-md">
                      <div className="text-sm font-black text-emerald-400">
                        ₹{portionPricing.price}
                      </div>
                      <div className="text-[9px] text-amber-300 font-bold">
                        {portionPricing.label}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                    <div>
                      <h4 className="font-black text-slate-100 text-sm">{food.name}</h4>
                      <p className="text-[11px] text-amber-300 font-bold mt-1">
                        🍴 {food.bestStallName}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        📍 {food.stallLocation}
                      </p>
                      {food.description && (
                        <p className="text-[10px] text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                          {food.description}
                        </p>
                      )}
                    </div>

                    {/* DYNAMIC FOOD PORTION & COMBO SELECTOR */}
                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-900/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                        <span>🍱 Select Meal Portion / Deal:</span>
                        <span className="text-emerald-400 font-mono">₹{portionPricing.price}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'half', label: 'Mini Meal', sub: 'Light' },
                          { id: 'regular', label: 'Regular', sub: 'Standard' },
                          { id: 'combo', label: 'Combo Deal', sub: '+Drink' }
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => updateFoodPortion(food.id, p.id)}
                            className={`p-1.5 rounded-lg text-center transition-all text-[10px] font-bold ${
                              currentPortion === p.id
                                ? 'bg-amber-600 text-white shadow-xs border border-amber-400'
                                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                            }`}
                          >
                            <div className="font-black leading-tight">{p.label}</div>
                            <div className="text-[9px] opacity-80">{p.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Hygiene: {food.hygieneRating} / 5.0</span>
                      </div>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.bestStallName + ' ' + selectedCity)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-500 text-white transition-all flex items-center gap-1 shadow-md shadow-amber-600/30"
                      >
                        <span>Directions</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs">
              No food items found under ₹{maxFoodBudget} in {selectedCity}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
