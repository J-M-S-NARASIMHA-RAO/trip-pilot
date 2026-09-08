import React, { useState, useEffect } from 'react';
import { 
  Navigation, AlertCircle, Share2, PhoneCall, CheckCircle2, 
  MapPin, Clock, ArrowRight, ShieldAlert, Sparkles, Volume2, 
  VolumeX, Users, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { translations } from '../translations';
import { 
  startEmergencySiren, 
  stopEmergencySiren, 
  shareTripOnWhatsApp, 
  getEmergencyContacts, 
  saveEmergencyContacts 
} from '../services/safetyService';

export default function TripMode({ currentLang, activeOption, originLocation, destinationName, stops = [], onEndTrip }) {
  const t = translations[currentLang] || translations.en;

  const [simulatedDeviation, setSimulatedDeviation] = useState(false);
  const [distanceRemaining, setDistanceRemaining] = useState(2.8);
  const [tripStep, setTripStep] = useState(1);
  const [sirenActive, setSirenActive] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [contacts, setContacts] = useState(getEmergencyContacts());
  const [driverRegInput, setDriverRegInput] = useState("");

  // Clean up siren on unmount
  useEffect(() => {
    return () => {
      stopEmergencySiren();
    };
  }, []);

  const handleToggleSiren = () => {
    if (sirenActive) {
      stopEmergencySiren();
      setSirenActive(false);
    } else {
      startEmergencySiren();
      setSirenActive(true);
    }
  };

  const handleShareWhatsApp = () => {
    const primaryPhone = contacts[0]?.phone?.replace(/\D/g, '') || "";
    shareTripOnWhatsApp({
      origin: originLocation?.name || "Visakhapatnam Railway Station",
      destination: destinationName || "Vizag Complex",
      vehicle: activeOption?.title || "Local Auto",
      lat: originLocation?.lat || 17.7214,
      lng: originLocation?.lng || 83.2929,
      driverReg: driverRegInput,
      contactNumber: primaryPhone
    });
  };

  const handleSaveContactChange = (index, field, value) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
    saveEmergencyContacts(updated);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-7 mb-8">
      
      {/* Active Trip Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/30">
            <Navigation className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Trip Mode Active
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                🛡️ GPS Safety Guard
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              🧭 Live Route & Tourist Safety Monitor
            </h2>
          </div>
        </div>

        {/* Safety & Emergency buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Siren Toggle */}
          <button
            onClick={handleToggleSiren}
            className={`flex items-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl transition-all shadow-md ${
              sirenActive 
                ? 'bg-red-600 text-white animate-bounce' 
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
          >
            {sirenActive ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span>{sirenActive ? "STOP SIREN" : "🚨 Safety Siren"}</span>
          </button>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-xl transition-all"
          >
            <Share2 className="h-3.5 w-3.5" /> WhatsApp SOS
          </button>

          {/* Trusted Contacts */}
          <button
            onClick={() => setShowContactsModal(true)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-all"
          >
            <Users className="h-3.5 w-3.5" /> Contacts
          </button>

          {/* Police 112 */}
          <a
            href="tel:112"
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-md"
          >
            <PhoneCall className="h-3.5 w-3.5" /> Police 112
          </a>
        </div>
      </div>

      {/* Driver Vehicle Reg Input (For Safety Proof) */}
      <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal-600" />
          <span className="font-bold text-slate-700">Driver / Vehicle Verification:</span>
        </div>
        <input
          type="text"
          placeholder="e.g. AP 31 TT 4921 (Optional)"
          value={driverRegInput}
          onChange={(e) => setDriverRegInput(e.target.value.toUpperCase())}
          className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Route Deviation Alert with Safety Checklist */}
      {simulatedDeviation ? (
        <div className="my-5 p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-amber-900">
                  ⚠️ Off-Route Deviation Detected (&gt;350m from planned route)
                </h4>
                <button
                  onClick={() => setSimulatedDeviation(false)}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded-xl"
                >
                  Dismiss / Re-aligned
                </button>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                "{t.offRouteWarning}"
              </p>

              {/* Instant Emergency Actions */}
              <div className="mt-4 p-3 bg-white/80 rounded-xl border border-amber-300/60 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-black text-amber-900">Immediate Actions:</span>
                <button
                  onClick={handleToggleSiren}
                  className="bg-red-600 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1"
                >
                  <Volume2 className="h-3 w-3" /> Sound Siren
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1"
                >
                  <Share2 className="h-3 w-3" /> Broadcast Location
                </button>
                <a
                  href="tel:112"
                  className="bg-slate-900 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1"
                >
                  <PhoneCall className="h-3 w-3" /> Dial 112
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="my-3 flex justify-end">
          <button
            onClick={() => setSimulatedDeviation(true)}
            className="text-[11px] text-slate-400 hover:text-amber-600 font-semibold underline"
          >
            Simulate Route Deviation Test
          </button>
        </div>
      )}

      {/* Journey Progression Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        
        {/* Origin */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Current Location
          </span>
          <p className="text-xs font-bold text-slate-800 truncate">
            {originLocation?.name || "Visakhapatnam Railway Station"}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">
            ✓ Departed
          </span>
        </div>

        {/* Intermediate Stops (if any) */}
        {stops && stops.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
              Intermediate Stops ({stops.length})
            </span>
            <div className="space-y-0.5 max-h-12 overflow-y-auto">
              {stops.map((st, idx) => (
                <p key={idx} className="text-[11px] font-bold text-amber-900 truncate">
                  {idx + 1}. {typeof st === 'string' ? st : (st?.name || `Stop ${idx + 1}`)}
                </p>
              ))}
            </div>
            <span className="text-[10px] text-amber-700 font-semibold mt-1 inline-block">
              Via scheduled waypoints
            </span>
          </div>
        )}

        {/* Transit In Progress */}
        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200">
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
            Vehicle & Protection
          </span>
          <p className="text-xs font-bold text-teal-900 truncate">
            {activeOption?.title || "Local Auto Rickshaw"}
          </p>
          <span className="text-[10px] text-teal-700 font-semibold mt-1 inline-block">
            Anti-Extortion active
          </span>
        </div>

        {/* Destination */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Destination Point
          </span>
          <p className="text-xs font-bold text-slate-800 truncate">
            {destinationName || "Vizag Complex"}
          </p>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">
            {distanceRemaining} km remaining
          </span>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => {
            setDistanceRemaining(Math.max(0, Math.round((distanceRemaining - 0.9) * 10) / 10));
            setTripStep(tripStep + 1);
          }}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2 rounded-xl transition-all"
        >
          Simulate Movement (-0.9 km)
        </button>

        <button
          onClick={() => {
            stopEmergencySiren();
            onEndTrip && onEndTrip();
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
        >
          Complete Journey & Explore Destination
        </button>
      </div>

      {/* Emergency Contacts Modal */}
      {showContactsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" />
                <h3 className="font-black text-slate-900 text-base">Emergency SOS Contacts</h3>
              </div>
              <button onClick={() => setShowContactsModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Add trusted phone numbers (with country code, e.g. 919876543210). When you tap WhatsApp SOS, an automated emergency tracking dispatch is sent.
            </p>

            <div className="space-y-3 mb-5">
              {contacts.map((c, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <input
                    type="text"
                    placeholder="Contact Name (e.g. Dad, Sister)"
                    value={c.name}
                    onChange={(e) => handleSaveContactChange(idx, 'name', e.target.value)}
                    className="w-full text-xs font-bold bg-transparent border-0 focus:outline-none text-slate-900"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number with country code (e.g. 919876543210)"
                    value={c.phone}
                    onChange={(e) => handleSaveContactChange(idx, 'phone', e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowContactsModal(false)}
                className="bg-teal-600 text-white font-bold text-xs px-5 py-2 rounded-xl"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
