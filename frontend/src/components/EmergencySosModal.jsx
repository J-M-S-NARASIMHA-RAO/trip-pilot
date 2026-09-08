import React, { useState } from 'react';

export default function EmergencySosModal({ isOpen, onClose, currentCoords = null, currentAddress = '' }) {
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const lat = currentCoords?.lat || 17.7214;
  const lng = currentCoords?.lng || 83.2929;
  const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
  const distressMsg = `🚨 EMERGENCY ALERT! I need help. My live location is: ${currentAddress ? currentAddress + ' - ' : ''}${mapsLink} (Sent via Trip Pilot SOS)`;

  const handleWhatsAppShare = () => {
    const cleanPhone = emergencyPhone.replace(/\D/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(distressMsg)}`
      : `https://wa.me/?text=${encodeURIComponent(distressMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyDistress = () => {
    navigator.clipboard?.writeText(distressMsg).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-rose-500/80 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-rose-950/50 border-b border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🚨</span>
            <div>
              <h3 className="font-extrabold text-rose-300 text-lg tracking-wide">EMERGENCY SOS HUB</h3>
              <p className="text-xs text-rose-200/80">Immediate safety hotlines & live GPS broadcast</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Current Live Coordinates Box */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs">
            <div className="text-slate-400 font-medium mb-1">YOUR CURRENT LIVE POSITION:</div>
            <div className="font-mono text-emerald-400 text-sm font-bold">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </div>
            {currentAddress && (
              <div className="text-slate-300 mt-1 truncate">
                📍 {currentAddress}
              </div>
            )}
          </div>

          {/* Quick 1-Tap Emergency Hotlines */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Statutory 24/7 Government Helplines (1-Tap Call)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:112"
                className="flex items-center justify-between p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <div>
                  <div className="text-xs font-normal opacity-90">All Emergencies</div>
                  <div>📞 Call 112</div>
                </div>
                <span className="text-lg">➔</span>
              </a>

              <a
                href="tel:1091"
                className="flex items-center justify-between p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <div>
                  <div className="text-xs font-normal opacity-90">Women Safety</div>
                  <div>📞 Call 1091</div>
                </div>
                <span className="text-lg">➔</span>
              </a>

              <a
                href="tel:100"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm border border-slate-700 transition-all active:scale-95"
              >
                <div>
                  <div className="text-xs font-normal text-slate-400">Police Control</div>
                  <div>👮 Police 100</div>
                </div>
                <span className="text-lg">➔</span>
              </a>

              <a
                href="tel:108"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm border border-slate-700 transition-all active:scale-95"
              >
                <div>
                  <div className="text-xs font-normal text-slate-400">Medical Ambulance</div>
                  <div>🚑 Medical 108</div>
                </div>
                <span className="text-lg">➔</span>
              </a>
            </div>
          </div>

          {/* WhatsApp Emergency Broadcast */}
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5">
            <label className="text-xs font-bold text-emerald-300 block mb-1">
              💬 Instant WhatsApp GPS Broadcast
            </label>
            <p className="text-[11px] text-slate-300 mb-3">
              Sends your live coordinates and Google Maps pin to family or trusted contact in 1 tap.
            </p>

            <div className="flex gap-2 mb-2">
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="Emergency Contact Phone (optional)"
                className="flex-1 bg-slate-800 text-slate-100 px-3 py-2 rounded-lg text-xs border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleWhatsAppShare}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Send</span>
                <span>📲</span>
              </button>
            </div>

            <button
              onClick={handleCopyDistress}
              className="w-full py-1.5 text-center text-xs font-medium text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              {copied ? '✓ Live distress message copied to clipboard!' : '📋 Copy Emergency Distress Message'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Trip Pilot does not track or store private contact information. All calls and messages run directly on your phone.
        </div>
      </div>
    </div>
  );
}
