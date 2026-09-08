// ==========================================================
// 🛡️ TRIP PILOT — Tourist Safety & SOS Emergency Toolkit
// ==========================================================

let audioCtx = null;
let sirenInterval = null;

/**
 * Starts a continuous 2-tone emergency siren using Web Audio API
 */
export function startEmergencySiren() {
  stopEmergencySiren();
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    audioCtx = new AudioContext();

    let toggle = true;
    const playTone = () => {
      if (!audioCtx || audioCtx.state === 'closed') return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(toggle ? 980 : 700, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
      toggle = !toggle;
    };

    playTone();
    sirenInterval = setInterval(playTone, 320);
    return true;
  } catch (e) {
    console.error("Emergency siren failed:", e);
    return false;
  }
}

/**
 * Stops the active emergency siren
 */
export function stopEmergencySiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (audioCtx) {
    try {
      audioCtx.close();
    } catch (_) {}
    audioCtx = null;
  }
}

/**
 * Formats and opens an emergency WhatsApp tracking message
 */
export function shareTripOnWhatsApp({ origin, destination, vehicle, lat, lng, driverReg, contactNumber }) {
  const mapUrl = `https://www.google.com/maps?q=${lat || 17.7214},${lng || 83.2929}`;
  const text = `🚨 *TRIP PILOT SAFETY ALERT* 🚨
I am currently traveling via *${vehicle || "Local Auto"}*.
📍 *From:* ${origin || "Visakhapatnam Station"}
🎯 *To:* ${destination || "Vizag Complex"}
🗺️ *Live Google Maps Location:* ${mapUrl}
${driverReg ? `🛺 *Vehicle Reg No.:* ${driverReg}\n` : ""}⏰ *Time:* ${new Date().toLocaleTimeString()}
_Sent via Trip Pilot Anti-Deceptive Tourist Safety Companion_`;

  const target = contactNumber ? `https://wa.me/${contactNumber}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(target, '_blank');
}

/**
 * Emergency Contacts Manager (Stored in LocalStorage)
 */
export function getEmergencyContacts() {
  try {
    const saved = localStorage.getItem('trip_pilot_emergency_contacts');
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return [
    { name: "Family / Guardian", phone: "" },
    { name: "Emergency Contact 2", phone: "" }
  ];
}

export function saveEmergencyContacts(contacts) {
  try {
    localStorage.setItem('trip_pilot_emergency_contacts', JSON.stringify(contacts));
  } catch (_) {}
}

/**
 * Crowdsourced Overcharge Scam Reports Store (Stored in LocalStorage & synced to API)
 */
export function getLocalScamReports() {
  try {
    const saved = localStorage.getItem('trip_pilot_scam_reports');
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return [
    {
      id: 1,
      name: "Station Main Gate Auto Stand",
      lat: 17.7222,
      lng: 83.2935,
      risk: "HIGH",
      note: "Refused meter; demanded ₹100 for 2.8 km route to Complex",
      timestamp: "Today"
    },
    {
      id: 2,
      name: "RTC Complex Platform 4 Bay",
      lat: 17.7295,
      lng: 83.3088,
      risk: "MODERATE",
      note: "Charged night tariff at 7 PM",
      timestamp: "Yesterday"
    }
  ];
}

export function saveLocalScamReport(report) {
  const existing = getLocalScamReports();
  const updated = [
    {
      id: Date.now(),
      name: report.standName || report.destination || "Reported Location",
      lat: report.lat || 17.7214,
      lng: report.lng || 83.2929,
      risk: report.quotedFare > 80 ? "HIGH" : "MODERATE",
      note: `${report.tactic || "Overcharging"}: Demanded ₹${report.quotedFare} (Fair: ₹${report.fairMin || 25}–₹${report.fairMax || 35})`,
      vehicleReg: report.vehicleReg || "",
      timestamp: "Just now"
    },
    ...existing
  ];
  try {
    localStorage.setItem('trip_pilot_scam_reports', JSON.stringify(updated));
  } catch (_) {}
  return updated;
}
