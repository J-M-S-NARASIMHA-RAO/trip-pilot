import React from 'react';

export default function HackathonScenariosModal({ isOpen, onClose, onSelectScenario }) {
  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'vskp-station-complex',
      city: 'Visakhapatnam',
      badge: 'Flagship Scenario',
      badgeColor: 'emerald',
      title: 'VSKP Railway Station ➔ Vizag RTC Complex',
      distanceKm: 2.8,
      quotedFare: 100,
      fairFare: '₹20 – ₹30',
      deviation: '+233% High Deviation',
      source: 'Visakhapatnam Railway Station',
      destination: 'Vizag Complex',
      transportType: 'AUTO',
      pickupCoords: { lat: 17.7214, lng: 83.2929 },
      dropCoords: { lat: 17.7295, lng: 83.3088 },
      desc: 'Driver quotes ₹100 for a 2.8 km ride outside platform 1 exit. Trip Pilot flags unfair pricing, alerts driver of municipal AP RTO meter tariff, and recommends RTC 28A bus for ₹10.',
      tags: ['Auto Rickshaw', 'High Deviation', 'RTC Alternative']
    },
    {
      id: 'hyd-secunderabad-charminar',
      city: 'Hyderabad',
      badge: 'Metro City Overcharge',
      badgeColor: 'indigo',
      title: 'Secunderabad Junction ➔ Charminar',
      distanceKm: 9.8,
      quotedFare: 250,
      fairFare: '₹110 – ₹130',
      deviation: '+110% High Deviation',
      source: 'Secunderabad Junction (SC)',
      destination: 'Charminar, Old City',
      transportType: 'AUTO',
      pickupCoords: { lat: 17.4334, lng: 78.5015 },
      dropCoords: { lat: 17.3616, lng: 78.4747 },
      desc: 'Late-night arrival quotation of ₹250. System calculates TSRTC night meter formula, warns passenger, and shows direct Green Line Metro connection.',
      tags: ['Late Night', 'Metro Integration', 'Old City']
    },
    {
      id: 'blr-majestic-indiranagar',
      city: 'Bengaluru',
      badge: 'Tech Hub Commute',
      badgeColor: 'purple',
      title: 'Majestic KSR ➔ 100ft Road Indiranagar',
      distanceKm: 8.5,
      quotedFare: 300,
      fairFare: '₹125 – ₹145',
      deviation: '+120% High Deviation',
      source: 'KSR Bengaluru City Station (Majestic)',
      destination: 'Indiranagar 100ft Road',
      transportType: 'AUTO',
      pickupCoords: { lat: 12.9781, lng: 77.5696 },
      dropCoords: { lat: 12.9719, lng: 77.6412 },
      desc: 'Driver demands ₹300 citing evening peak Bangalore traffic. System calculates statutory KA RTO base + per km rate and offers Rapido Bike Taxi at ₹85.',
      tags: ['Peak Traffic', 'Rapido Bike', 'Namma Metro']
    },
    {
      id: 'del-ndls-indiagate',
      city: 'Delhi',
      badge: 'Capital Tourist Route',
      badgeColor: 'amber',
      title: 'New Delhi Railway Station (NDLS) ➔ India Gate',
      distanceKm: 4.6,
      quotedFare: 200,
      fairFare: '₹60 – ₹75',
      deviation: '+190% High Deviation',
      source: 'New Delhi Railway Station (NDLS)',
      destination: 'India Gate, Rajpath',
      transportType: 'AUTO',
      pickupCoords: { lat: 28.6431, lng: 77.2197 },
      dropCoords: { lat: 28.6129, lng: 77.2295 },
      desc: 'First-time tourist arriving in Delhi quoted ₹200 for a 4.6 km hop. App shows Delhi Transport Department statutory fare of ₹65 and Central Secretariat Yellow Line metro.',
      tags: ['First-Time Tourist', 'Statutory Fare', 'Delhi Metro']
    },
    {
      id: 'mum-csmt-marinedrive',
      city: 'Mumbai',
      badge: 'Heritage Shoreline',
      badgeColor: 'sky',
      title: 'CSMT Station ➔ Marine Drive (Queen\'s Necklace)',
      distanceKm: 3.2,
      quotedFare: 150,
      fairFare: '₹45 – ₹60',
      deviation: '+175% High Deviation',
      source: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
      destination: 'Marine Drive Promenade',
      transportType: 'CAB',
      pickupCoords: { lat: 18.9401, lng: 72.8354 },
      dropCoords: { lat: 18.9430, lng: 72.8230 },
      desc: 'Tourist quoted flat ₹150 for Kali-Peeli cab from CSMT to Marine Drive without turning on meter. Trip Pilot displays MMRTA meter chart and BEST Bus 138 route.',
      tags: ['Kali Peeli Cab', 'MMRTA Tariff', 'BEST Bus']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div>
              <h3 className="font-bold text-slate-100 text-base">1-Click Jury Demonstration Scenarios</h3>
              <p className="text-xs text-slate-400">
                Instantly load real-world overcharging scenarios across 5 major Indian cities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scenarios List */}
        <div className="p-4 overflow-y-auto space-y-3">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              data-scenario-id={sc.id}
              onClick={() => {
                onSelectScenario(sc);
                onClose();
              }}
              className="group p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/60 rounded-xl cursor-pointer transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {sc.city} • {sc.badge}
                  </span>
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    {sc.deviation}
                  </span>
                </div>

                <h4 className="font-bold text-slate-100 text-sm group-hover:text-emerald-300 transition-colors">
                  {sc.title}
                </h4>

                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {sc.desc}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    Distance: <strong className="text-slate-200">{sc.distanceKm} km</strong>
                  </span>
                  <span className="text-rose-400">
                    Quoted: <strong>₹{sc.quotedFare}</strong>
                  </span>
                  <span className="text-emerald-400">
                    Fair Tariff: <strong>{sc.fairFare}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  data-load-btn={sc.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectScenario(sc);
                    onClose();
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>Load Scenario</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 text-center text-xs text-slate-500">
          Select any preset to auto-populate inputs, simulate route navigation, and run instant anti-deception audits.
        </div>
      </div>
    </div>
  );
}
