import React, { useState, useEffect } from 'react';
import { 
  Bed, Utensils, ExternalLink, ShieldCheck, MapPin, 
  Train, Star, Sparkles, Filter, Search, ArrowUpRight 
} from 'lucide-react';
import { getAccommodations, getRegionalFoods } from '../api';

export default function StayAndFoodExplorer({ currentCity = 'Visakhapatnam' }) {
  const [activeTab, setActiveTab] = useState('stays'); // 'stays' | 'food'
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Visakhapatnam');
  const [customCityInput, setCustomCityInput] = useState('');
  const [stays, setStays] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maxStayBudget, setMaxStayBudget] = useState(1200);
  const [maxFoodBudget, setMaxFoodBudget] = useState(150);

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
              <h3 className="font-black text-slate-100 text-lg sm:text-xl tracking-tight">
                {activeTab === 'stays' 
                  ? `Backpacker Stays & Dorms in ${selectedCity}` 
                  : `Regional Food & Budget Radar in ${selectedCity}`}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTab === 'stays'
                  ? 'Curated IRCTC retiring rooms, YHAI hostels, and student pods with direct official booking'
                  : 'Authentic local street delicacies and hygienic budget food hubs under ₹150'}
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
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5 mb-6 bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800">
        
        {/* City Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-indigo-400" /> City:
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

        {/* Budget filters */}
        {activeTab === 'stays' ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Filter className="h-3 w-3 text-indigo-400" /> Max Budget:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '≤ ₹350', val: 350, tag: 'IRCTC / Govt' },
                { label: '≤ ₹500', val: 500, tag: 'Student' },
                { label: '≤ ₹800', val: 800, tag: 'Bunks' },
                { label: '≤ ₹1200', val: 1200, tag: 'All Dorms' }
              ].map((b) => (
                <button
                  key={b.val}
                  onClick={() => setMaxStayBudget(b.val)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    maxStayBudget === b.val
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                  title={b.tag}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Max Meal Price:</span>
            <div className="flex gap-1.5">
              {[50, 90, 150].map((b) => (
                <button
                  key={b}
                  onClick={() => setMaxFoodBudget(b)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    maxFoodBudget === b
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  ≤ ₹{b}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400">
          <div className="w-9 h-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-xs font-bold">Finding verified budget stays in {selectedCity}...</span>
        </div>
      ) : activeTab === 'stays' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stays.length > 0 ? (
            stays.map((stay) => (
              <div
                key={stay.id}
                onClick={() => handleOpenOfficialLink(stay.bookingUrl)}
                className="group bg-slate-800/70 border border-slate-700/70 rounded-2xl overflow-hidden hover:border-indigo-500/80 hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col justify-between cursor-pointer"
              >
                {/* Photo & Price Banner */}
                <div className="relative h-44 bg-slate-950 overflow-hidden">
                  <img
                    src={stay.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'}
                    alt={stay.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'; }}
                  />
                  
                  {/* Official Authority Badge */}
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5 items-center">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-950/85 backdrop-blur-md text-indigo-300 border border-indigo-500/40 shadow-sm flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-indigo-400" />
                      <span>{stay.badge || stay.type}</span>
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl text-xs font-black bg-slate-950/90 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-md">
                    ₹{stay.pricePerNight?.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">/ night</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
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

                    {stay.amenities && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/50">
                        <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                          ✨ {stay.amenities}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Rating & Official Redirection CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-black">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{stay.rating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({stay.reviewCount})</span>
                    </div>

                    <a
                      href={stay.bookingUrl || 'https://www.irctctourism.com/retiringroom'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 group-hover:scale-105 active:scale-95"
                    >
                      <span>Official Page</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 px-4 text-center bg-slate-800/30 rounded-2xl border border-slate-800">
              <p className="text-slate-300 font-bold text-sm">
                No stays found under ₹{maxStayBudget} in {selectedCity}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Try increasing your budget filter to see more verified hostels and IRCTC rooms.
              </p>
              <button
                onClick={() => setMaxStayBudget(1500)}
                className="mt-3.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                View All Stays (≤ ₹1500)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Regional Food Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {foods.length > 0 ? (
            foods.map((food) => (
              <div
                key={food.id}
                className="bg-slate-800/70 border border-slate-700/70 rounded-2xl overflow-hidden hover:border-amber-500/80 transition-all flex flex-col justify-between"
              >
                <div className="relative h-40 bg-slate-950 overflow-hidden">
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
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl text-xs font-black bg-slate-950/90 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-sm">
                    ₹{food.typicalPrice?.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">avg</span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
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

                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
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
            ))
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
