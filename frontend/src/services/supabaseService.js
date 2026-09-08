// ==========================================================
// ⚡ TRIP PILOT — Supabase Cloud Database & Sync Service
// ==========================================================

export function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('trip_pilot_supabase_url') || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('trip_pilot_supabase_key') || '';
  return { url: url.trim(), key: key.trim() };
}

export function setSupabaseConfig(url, key) {
  if (url && key) {
    localStorage.setItem('trip_pilot_supabase_url', url.trim());
    localStorage.setItem('trip_pilot_supabase_key', key.trim());
  } else {
    localStorage.removeItem('trip_pilot_supabase_url');
    localStorage.removeItem('trip_pilot_supabase_key');
  }
}

/**
 * Saves a reported overcharge incident to Supabase public.fare_reports table
 */
export async function saveScamReportToSupabase(report) {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/rest/v1/fare_reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        source: report.origin || "Visakhapatnam Railway Station",
        destination: report.destination || "Vizag Complex",
        transportation_type: report.transportType || "AUTO",
        quoted_price: Number(report.quotedFare),
        estimated_min_price: Number(report.fairMin || 25),
        estimated_max_price: Number(report.fairMax || 35),
        deviation_percentage: Number(report.deviation || 100),
        risk_level: report.risk || "HIGH",
        confidence_level: "USER_REPORTED",
        confidence_score: 87.0
      })
    });

    return res.ok;
  } catch (err) {
    console.warn("Supabase report sync failed:", err);
    return null;
  }
}

/**
 * Saves a completed trip record to Supabase public.trips table
 */
export async function saveTripToSupabase(trip) {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/rest/v1/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        source: trip.source || "Visakhapatnam Railway Station",
        destination: trip.destination || "Vizag Complex",
        stops: trip.stops || [],
        travelers: trip.travelers || 1,
        selected_option: trip.vehicle || "AUTO",
        total_cost: trip.totalCost || 30.0,
        status: "COMPLETED"
      })
    });

    return res.ok;
  } catch (err) {
    console.warn("Supabase trip save failed:", err);
    return null;
  }
}
