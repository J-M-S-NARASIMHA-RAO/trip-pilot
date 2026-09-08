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
    const { source, destination, stops = [], transportationType = "AUTO", quotedFare = 100, passengers = 1, city = "Visakhapatnam" } = await req.json();

    let distanceKm = 2.8;
    const lowerDest = (destination || "").toLowerCase();
    if (lowerDest.includes("beach") || lowerDest.includes("rk")) distanceKm = 5.2;
    else if (lowerDest.includes("kailasagiri")) distanceKm = 11.5;
    else if (lowerDest.includes("rushikonda")) distanceKm = 17.0;
    else if (lowerDest.includes("submarine")) distanceKm = 5.5;

    // Multi-stops addition
    if (stops && stops.length > 0) {
      distanceKm += stops.length * 2.5;
    }

    const type = (transportationType || "AUTO").toUpperCase();
    let minFair = 25.0;
    let maxFair = 35.0;

    if (type === "BUS") {
      minFair = 10.0;
      maxFair = 18.0;
    } else if (type === "CAB") {
      minFair = 80.0;
      maxFair = 115.0;
    } else {
      // Auto
      const raw = Math.max(20.0, 20.0 + Math.max(0, distanceKm - 1.5) * 12.0);
      minFair = Math.floor(raw / 5.0) * 5.0;
      maxFair = Math.ceil((raw * 1.25) / 5.0) * 5.0;
    }

    const diff = Math.max(0, quotedFare - maxFair);
    const deviation = Math.round(((quotedFare - maxFair) / maxFair) * 100);
    const level = deviation > 45 ? "HIGH" : (deviation > 15 ? "MODERATE" : "LOW");

    const responseData = {
      source: source || "Visakhapatnam Railway Station",
      destination: destination || "Vizag Complex",
      stops: stops,
      transportationType: type,
      quotedFare: Number(quotedFare),
      estimatedMinFare: minFair,
      estimatedMaxFare: maxFair,
      priceDifference: Math.round(diff * 10.0) / 10.0,
      deviationPercentage: deviation,
      deviationLevel: level,
      deviationHeadline: level === "HIGH" ? "🔴 High Price Deviation" : (level === "MODERATE" ? "🟡 Moderate Price Deviation" : "🟢 Fair Price"),
      advisoryMessage: level === "HIGH"
        ? "The quoted fare is significantly higher than the estimated fair fare range for this route. Consider negotiating or booking through Rapido/Uber."
        : "The quoted fare is reasonable for this distance.",
      confidenceScore: 87.0,
      confidenceLabel: "VERIFIED",
      distanceKm: Math.round(distanceKm * 10.0) / 10.0,
      estimatedTimeMinutes: Math.round(distanceKm * 2.8) + 4,
      multiStopNotice: stops.length > 0 ? `📍 Multi-Stop Route: ${source} ➔ ${stops.join(' ➔ ')} ➔ ${destination}` : null,
      possibleFactors: [
        "Higher demand or surge pricing during rush hour",
        "Return empty-trip compensation for outer destinations",
        "Multiple passenger surcharge",
        "Lack of digital meter calibration"
      ],
      recommendedAction: `Politely request standard fare (around ₹${minFair}–₹${maxFair}) or book directly on Rapido / Uber.`
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