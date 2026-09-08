import React, { useState, useEffect } from 'react';
import { getAccommodations, getRegionalFoods } from '../api';

export default function StayAndFoodExplorer({ currentCity = 'Visakhapatnam' }) {
  const [activeTab, setActiveTab] = useState('stays'); // 'stays' | 'food'
  const [selectedCity, setSelectedCity] = useState(currentCity);
  const [stays, setStays] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maxStayBudget, setMaxStayBudget] = useState(1000);
  const [maxFoodBudget, setMaxFoodBudget] = useState(150);

  useEffect(() => {
    setSelectedCity(currentCity);
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

  const cities = ['Visakhapatnam', 'Hyderabad', 'Bengaluru', 'Delhi', 'Mumbai'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeTab === 'stays' ? '🛏️' : '🍲'}</span>
            <h3 className="font-bold text-slate-100 text-lg">
              {activeTab === 'stays' ? 'Backpacker Stays & Dorms' : 'Regional Food & Budget Radar'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Curated student-friendly dorms, verified hostels, and budget street delicacies under ₹150
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('stays')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'stays'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛏️ Hostels & Dorms
          </button>
          <button
            onClick={() => setActiveTab('food')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'food'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🍲 Regional Food
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">City:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Budget filters */}
        {activeTab === 'stays' ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Max Budget:</span>
            <div className="flex gap-1.5">
              {[400, 700, 1000].map((b) => (
                <button
                  key={b}
                  onClick={() => setMaxStayBudget(b)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    maxStayBudget === b
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ≤ ₹{b}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Max Price:</span>
            <div className="flex gap-1.5">
              {[50, 90, 150].map((b) => (
                <button
                  key={b}
                  onClick={() => setMaxFoodBudget(b)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    maxFoodBudget === b
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
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
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-xs">Loading verified recommendations for {selectedCity}...</span>
        </div>
      ) : activeTab === 'stays' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stays.length > 0 ? (
            stays.map((stay) => (
              <div
                key={stay.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all flex flex-col justify-between"
              >
                <div className="relative h-36 bg-slate-900 overflow-hidden">
                  <img
                    src={stay.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'}
                    alt={stay.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'; }}
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 backdrop-blur text-indigo-300 border border-indigo-500/30">
                      {stay.type}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-bold bg-slate-950/80 backdrop-blur text-emerald-400">
                    ₹{stay.pricePerNight?.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">/ night</span>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{stay.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>📍</span> {stay.address}
                    </p>
                    {stay.nearHub && (
                      <p className="text-[10px] text-indigo-300 mt-1 flex items-center gap-1">
                        <span>🚉</span> Near {stay.nearHub}
                      </p>
                    )}
                    {stay.amenities && (
                      <p className="text-[10px] text-slate-400 mt-2 line-clamp-1">
                        ✨ {stay.amenities}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <span>★</span>
                      <span>{stay.rating}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({stay.reviewCount})</span>
                    </div>

                    {stay.bookingUrl && (
                      <a
                        href={stay.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1"
                      >
                        <span>Official Stay</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs">
              No stays found under ₹{maxStayBudget} in {selectedCity}. Try increasing budget filter.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods.length > 0 ? (
            foods.map((food) => (
              <div
                key={food.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between"
              >
                <div className="relative h-36 bg-slate-900 overflow-hidden">
                  <img
                    src={food.imageUrl || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800'}
                    alt={food.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800'; }}
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 backdrop-blur text-amber-300 border border-amber-500/30">
                      {food.cuisine}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-bold bg-slate-950/80 backdrop-blur text-emerald-400">
                    ₹{food.typicalPrice?.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">avg</span>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{food.name}</h4>
                    <p className="text-[11px] text-amber-300/90 font-medium mt-1">
                      🍴 {food.bestStallName}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      📍 {food.stallLocation}
                    </p>
                    {food.description && (
                      <p className="text-[10px] text-slate-300 mt-2 line-clamp-2">
                        {food.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <span>🛡️ Hygiene:</span>
                      <span className="font-bold">{food.hygieneRating} / 5.0</span>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.bestStallName + ' ' + selectedCity)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center gap-1"
                    >
                      <span>Directions</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs">
              No food items found under ₹{maxFoodBudget} in {selectedCity}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
