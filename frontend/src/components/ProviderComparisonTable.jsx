import React, { useState, useEffect } from 'react';
import { compareProviders } from '../api';

export default function ProviderComparisonTable({
  city = 'Visakhapatnam',
  origin = 'Current Location',
  destination = 'Vizag Complex',
  distanceKm = 2.8,
  pickupCoords = null,
  dropCoords = null
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchComparison() {
      if (!destination || destination.trim() === '') {
        setData(null);
        return;
      }
      setLoading(true);
      try {
        const res = await compareProviders({
          city,
          origin: origin || 'Current Location',
          destination,
          distanceKm: distanceKm || 2.8,
          pickupLat: pickupCoords?.lat,
          pickupLon: pickupCoords?.lng,
          dropLat: dropCoords?.lat,
          dropLon: dropCoords?.lng
        });
        if (isMounted) setData(res);
      } catch (err) {
        console.error('Failed to load comparison', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchComparison();
    return () => { isMounted = false; };
  }, [city, origin, destination, distanceKm, pickupCoords, dropCoords]);

  const handleCopyAndOpen = (option) => {
    if (destination) {
      navigator.clipboard?.writeText(destination).catch(() => {});
      setCopiedId(option.id);
      setTimeout(() => setCopiedId(null), 3000);
    }
    if (option.deepLink) {
      window.open(option.deepLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (!destination || destination.trim() === '') {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        <span className="text-3xl mb-2 block">🚖</span>
        <p className="font-medium text-slate-200">Enter destination to compare live fares</p>
        <p className="text-xs text-slate-500 mt-1">
          Compare Government Meter Auto, Rapido Bike, Uber Auto, City Bus & Walking side-by-side.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <h3 className="font-bold text-slate-100 text-base">Multi-Provider Comparison Matrix</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {data?.distanceKm ? `${data.distanceKm} km route` : ''} • Real-time statutory vs aggregator rates
          </p>
        </div>
        {data?.nightTariffActive && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            🌙 Night Tariff Active (1.5x)
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-xs">Computing statutory and aggregator tariffs...</span>
        </div>
      ) : data?.options && data.options.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 uppercase text-[11px] text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Service / Mode</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Est. Fare</th>
                <th className="py-2.5 px-3">ETA</th>
                <th className="py-2.5 px-3">Data Provenance</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.options.map((opt) => (
                <tr
                  key={opt.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    opt.recommended ? 'bg-emerald-950/20 border-l-2 border-emerald-500' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                      {opt.serviceName}
                      {opt.recommended && (
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                          Best Value
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">
                      {opt.advisory}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {opt.category}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-bold text-sm text-slate-100">
                    {opt.fareFormatted}
                  </td>

                  <td className="py-3 px-3 text-slate-300 font-medium">
                    ⏱️ {opt.etaFormatted}
                  </td>

                  <td className="py-3 px-3">
                    {opt.provenanceBadge === 'TARIFF_VERIFIED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        🛡️ Tariff Verified
                      </span>
                    ) : opt.provenanceBadge === 'PUBLIC_TRANSIT' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        🚌 Public Transit
                      </span>
                    ) : opt.provenanceBadge === 'ZERO_EMISSION' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-lime-500/20 text-lime-300 border border-lime-500/40">
                        🌱 Zero Emission
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        📱 App Estimate
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    {opt.deepLink ? (
                      <button
                        onClick={() => handleCopyAndOpen(opt)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm flex items-center gap-1 ml-auto"
                        title="Destination will be copied to clipboard and auto-filled"
                      >
                        <span>{copiedId === opt.id ? '✓ Copied & Opening' : `Book on ${opt.provider}`}</span>
                        <span>↗</span>
                      </button>
                    ) : opt.bookingAction === 'INSIST_ON_METER' ? (
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Meter Rule
                      </span>
                    ) : opt.bookingAction === 'BOARD_BUS' ? (
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Stage Ticket
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-400">
                        Walk Free
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-4">No providers available for this route.</p>
      )}

      {/* Ethical Distinction Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-400">ℹ️</span>
          <span>
            Trip Pilot serves as your decision & navigation advisor and redirects to official apps with pre-filled destination.
          </span>
        </div>
        <div className="text-slate-500 font-mono">Anti-Deceptive Mobility Engine</div>
      </div>
    </div>
  );
}
