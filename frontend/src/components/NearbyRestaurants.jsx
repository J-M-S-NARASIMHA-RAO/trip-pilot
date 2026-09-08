import React, { useState, useEffect } from 'react';
import { 
  Utensils, Star, DollarSign, MapPin, MessageSquare, 
  ArrowRight, ThumbsUp, Sparkles, Filter, Navigation, ExternalLink 
} from 'lucide-react';
import { translations } from '../translations';
import { getNearbyRestaurants } from '../api';

export default function NearbyRestaurants({ currentLang, originLocation, onSelectRestaurant }) {
  const t = translations[currentLang] || translations.en;

  const [restaurants, setRestaurants] = useState([]);
  const [priceFilter, setPriceFilter] = useState("BUDGET_FRIENDLY");
  const [foodTypeFilter, setFoodTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("price_low");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const city = (originLocation?.city && originLocation.city !== "Locating...") ? originLocation.city : "Visakhapatnam";
    getNearbyRestaurants(city, priceFilter, sortBy)
      .then(data => {
        setRestaurants(data);
      })
      .finally(() => setLoading(false));
  }, [originLocation, priceFilter, sortBy]);

  const filteredRestaurants = restaurants.filter(r => {
    if (foodTypeFilter === "ALL") return true;
    if (foodTypeFilter === "TIFFIN") return r.cuisine?.toLowerCase().includes("tiffin") || r.name?.toLowerCase().includes("parlour") || r.name?.toLowerCase().includes("vantillu");
    if (foodTypeFilter === "MEALS") return r.cuisine?.toLowerCase().includes("meals") || r.cuisine?.toLowerCase().includes("bhojanam") || r.name?.toLowerCase().includes("subbayya");
    if (foodTypeFilter === "STREET") return r.cuisine?.toLowerCase().includes("street") || r.area?.toLowerCase().includes("lane") || r.name?.toLowerCase().includes("street");
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-5 sm:p-7 mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
              🍲 Budget Food Radar (&lt; ₹150)
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Near {originLocation?.name || "Visakhapatnam"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            🍲 Nearby Budget-Friendly Food Shops
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Authentic local tiffin centres, mess, and street food shops where you can enjoy complete, hygienic meals for ₹40–₹140.
          </p>
        </div>

        {/* Proximity / City badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1">
            <span>📍</span> {originLocation?.city || "Visakhapatnam"}
          </span>
        </div>
      </div>

      {/* Filters and Sorting Toolbar */}
      <div className="my-5 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
        
        {/* Price Tier & Food Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => { setPriceFilter("BUDGET_FRIENDLY"); setFoodTypeFilter("ALL"); }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              priceFilter === "BUDGET_FRIENDLY" && foodTypeFilter === "ALL" 
                ? "bg-emerald-600 text-white shadow-xs font-black" 
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            💰 All Budget Shops (&lt; ₹150)
          </button>
          <button
            onClick={() => { setPriceFilter("BUDGET_FRIENDLY"); setFoodTypeFilter("TIFFIN"); }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              foodTypeFilter === "TIFFIN" 
                ? "bg-emerald-700 text-white shadow-xs font-black" 
                : "bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200"
            }`}
          >
            🥞 Tiffins & Dosas (₹40–₹70)
          </button>
          <button
            onClick={() => { setPriceFilter("BUDGET_FRIENDLY"); setFoodTypeFilter("MEALS"); }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              foodTypeFilter === "MEALS" 
                ? "bg-emerald-700 text-white shadow-xs font-black" 
                : "bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200"
            }`}
          >
            🍛 Andhra Meals & Thalis (₹90–₹140)
          </button>
          <button
            onClick={() => { setPriceFilter("BUDGET_FRIENDLY"); setFoodTypeFilter("STREET"); }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              foodTypeFilter === "STREET" 
                ? "bg-emerald-700 text-white shadow-xs font-black" 
                : "bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200"
            }`}
          >
            🍢 Street Food & Snacks (₹30–₹80)
          </button>
          <button
            onClick={() => { setPriceFilter("ALL"); setFoodTypeFilter("ALL"); }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              priceFilter === "ALL" ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Show All
          </button>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="rating">Customer Reviews (Highest First)</option>
            <option value="price_low">Price (Budget Friendly First)</option>
            <option value="distance">Proximity (Nearest First)</option>
          </select>
        </div>

      </div>

      {/* Restaurants List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading restaurants and local talks...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRestaurants.map((rest) => (
            <div
              key={rest.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                
                {/* Image & Badges */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={rest.imageUrl}
                    alt={rest.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                      {rest.area}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      rest.priceCategory === 'BUDGET_FRIENDLY'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-teal-600 text-white'
                    }`}>
                      {rest.priceCategory === 'BUDGET_FRIENDLY' ? '₹ Budget Friendly' : '₹₹ Moderate'}
                    </span>
                  </div>

                  {/* Rating Pill */}
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1.5 text-xs font-black text-slate-900">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    <span>{rest.rating}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">({rest.reviewCount})</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-slate-900">{rest.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{rest.cuisine}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                      ~₹{rest.approxCostForTwo} for 2
                    </span>
                  </div>

                  {/* Famous dishes */}
                  <p className="text-[11px] text-slate-600">
                    <strong className="text-slate-800">Must Try:</strong> {rest.famousDishes}
                  </p>

                  {/* HIGHLIGHTED LOCAL TALK (Requested by user) */}
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 text-xs leading-relaxed">
                    <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider text-amber-800 mb-1">
                      <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                      {t.localTalk}
                    </div>
                    <p className="italic font-medium">
                      "{rest.localTalk}"
                    </p>
                  </div>
                </div>

              </div>

              {/* Bottom CTA */}
              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <MapPin className="h-3 w-3 text-slate-400" /> {rest.distanceMeters < 1000 ? `${rest.distanceMeters}m away` : `${(rest.distanceMeters / 1000).toFixed(1)} km`}
                </span>

                <button
                  onClick={() => onSelectRestaurant && onSelectRestaurant(rest.name)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                >
                  Ride Here <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}