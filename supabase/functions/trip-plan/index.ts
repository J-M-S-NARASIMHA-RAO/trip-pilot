import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { source = "Visakhapatnam Railway Station", destination = "Vizag Complex", stops = [], travelers = 1, budget = 100, userMode = "TOURIST" } = await req.json();

    let distanceKm = 2.8;
    const lowerDest = (destination || "").toLowerCase();
    if (lowerDest.includes("beach") || lowerDest.includes("rk")) distanceKm = 5.2;
    else if (lowerDest.includes("kailasagiri")) distanceKm = 11.5;
    else if (lowerDest.includes("rushikonda")) distanceKm = 17.0;
    else if (lowerDest.includes("submarine")) distanceKm = 5.5;

    if (stops && stops.length > 0) {
      distanceKm += stops.length * 2.5;
    }

    const pax = Math.max(1, travelers);
    const busCost = 10 * pax;
    const autoCost = Math.round(Math.max(25, 20 + distanceKm * 12) * Math.ceil(pax / 3));
    const cabCost = Math.round(Math.max(80, 60 + distanceKm * 16) * Math.ceil(pax / 4));

    const options = [
      {
        type: "AUTO",
        title: "Local Auto Rickshaw",
        provider: "Regulated Stand / Rapido Auto",
        estimatedFareMin: autoCost - 5,
        estimatedFareMax: autoCost + 10,
        totalCost: autoCost,
        costPerPerson: Math.round(autoCost / pax),
        durationMinutes: Math.round(distanceKm * 2.8) + 4,
        convenience: "HIGH",
        badge: "BEST_OVERALL",
        stepsSummary: "Direct point-to-point drop; agile in city traffic"
      },
      {
        type: "BUS",
        title: "APSRTC City Bus",
        provider: "APSRTC Metro Express",
        estimatedFareMin: 10 * pax,
        estimatedFareMax: 15 * pax,
        totalCost: busCost,
        costPerPerson: 10,
        durationMinutes: Math.round(distanceKm * 4.5) + 8,
        convenience: "MEDIUM",
        badge: "CHEAPEST",
        stepsSummary: "Board right outside station gate -> Direct drop"
      },
      {
        type: "CAB",
        title: "App Cab / Uber Go",
        provider: "Uber / Rapido Cab",
        estimatedFareMin: cabCost - 10,
        estimatedFareMax: cabCost + 20,
        totalCost: cabCost,
        costPerPerson: Math.round(cabCost / pax),
        durationMinutes: Math.round(distanceKm * 2.2) + 5,
        convenience: "VERY_HIGH",
        badge: "FASTEST",
        stepsSummary: "Air-conditioned comfort with GPS live tracking"
      }
    ];

    const responseData = {
      source,
      destination,
      stops,
      distanceKm: Math.round(distanceKm * 10.0) / 10.0,
      estimatedDistanceTime: Math.round(distanceKm * 2.8) + 4,
      travelers: pax,
      budget,
      userMode,
      multiStopNotice: stops.length > 0 ? `📍 Multi-Stop Itinerary: ${source} ➔ ${stops.join(' ➔ ')} ➔ ${destination}` : null,
      groupSavingsNotice: pax > 1 ? `👥 Group Travel Saver: For ${pax} travelers, choosing public/shared option saves your group approximately ₹${Math.max(0, autoCost - busCost)}!` : null,
      recommendedOption: userMode === "STUDENT" ? options[1] : options[0],
      allOptions: options
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});