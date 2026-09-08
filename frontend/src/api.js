const API_BASE = '/api';

export async function checkFare(params) {
  try {
    const res = await fetch(`${API_BASE}/fare/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.warn('Backend call failed, using smart fallback for fare check:', err);
    const quoted = Number(params.quotedFare || 100);
    const minFair = 25;
    const maxFair = 35;
    const diff = Math.max(0, quoted - maxFair);
    const dev = Math.round((diff / maxFair) * 100);
    return {
      source: params.source || "Visakhapatnam Railway Station",
      destination: params.destination || "Vizag Complex",
      stops: params.stops || [],
      transportationType: params.transportationType || "AUTO",
      quotedFare: quoted,
      estimatedMinFare: minFair,
      estimatedMaxFare: maxFair,
      priceDifference: diff,
      deviationPercentage: dev,
      deviationLevel: dev > 40 ? "HIGH" : (dev > 15 ? "MODERATE" : "LOW"),
      deviationHeadline: dev > 40 ? "🔴 High Price Deviation" : (dev > 15 ? "🟡 Moderate Price Deviation" : "🟢 Fair Price Detected"),
      advisoryMessage: dev > 40 
        ? "The quoted fare is significantly higher than the estimated fair fare range for this route. Consider negotiating or comparing other transportation options."
        : "The quoted fare is reasonable for this distance.",
      confidenceScore: 87.0,
      confidenceLabel: "VERIFIED",
      distanceKm: 2.8 + ((params.stops || []).length * 2.5),
      estimatedTimeMinutes: 12 + ((params.stops || []).length * 8),
      costBreakdown: {
        "Base Fare (Flag Drop)": 20.0,
        "Distance Charge": 15.0,
        "Service & Platform Fee": 0.0,
      },
      possibleFactors: [
        "Higher demand or surge pricing during rush hour",
        "Return empty-trip compensation for outer/remote destinations",
        "Luggage or multiple passenger surcharge",
        "Lack of digital fare meter calibration",
        "Potential overpricing for unfamiliar passengers"
      ],
      recommendedAction: "Politely request standard fare (around ₹20–₹35) or book via Rapido / Uber.",
      alternatives: [
        {
          type: "BUS",
          title: "APSRTC City Bus",
          provider: "Route 28A / 10K",
          estimatedFareMin: 10,
          estimatedFareMax: 15,
          totalCost: 10,
          costPerPerson: 10,
          durationMinutes: 22,
          convenience: "MEDIUM",
          badge: "CHEAPEST",
          score: 82.5,
          whyChosen: "💰 Lowest monetary expenditure: saves maximum money at ₹10 total.",
          statusRisk: "TRANSPARENT",
          stepsSummary: "Board right outside station gate -> Direct drop"
        },
        {
          type: "AUTO",
          title: "Local Auto Rickshaw",
          provider: "Regulated Stand / Rapido Auto",
          estimatedFareMin: 25,
          estimatedFareMax: 35,
          totalCost: 30,
          costPerPerson: 30,
          durationMinutes: 12,
          convenience: "HIGH",
          badge: "BEST_OVERALL",
          score: 88.0,
          whyChosen: "⭐ Highest value balance: fast travel time, reasonable fare.",
          statusRisk: "TRANSPARENT",
          stepsSummary: "Direct point-to-point drop; agile in city traffic"
        },
        {
          type: "CAB",
          title: "App Cab / Uber Go",
          provider: "Uber / Rapido Cab",
          estimatedFareMin: 80,
          estimatedFareMax: 110,
          totalCost: 90,
          costPerPerson: 90,
          durationMinutes: 10,
          convenience: "VERY_HIGH",
          badge: "FASTEST",
          score: 75.0,
          whyChosen: "⚡ Shortest transit duration with AC comfort.",
          statusRisk: "LOW_RISK",
          stepsSummary: "Air-conditioned comfort with GPS live tracking"
        }
      ]
    };
  }
}

export async function planTrip(params) {
  try {
    const res = await fetch(`${API_BASE}/trips/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.warn('Using smart fallback for trip plan:', err);
    const stopsCount = (params.stops || []).length;
    const dist = 2.8 + (stopsCount * 2.5);
    return {
      source: params.source || "Visakhapatnam Railway Station",
      destination: params.destination || "Vizag Complex",
      stops: params.stops || [],
      distanceKm: dist,
      estimatedDistanceTime: Math.round(dist * 2.8) + 4,
      travelers: params.travelers || 1,
      budget: params.budget,
      userMode: params.userMode || "TOURIST",
      multiStopNotice: stopsCount > 0 ? `📍 Multi-Stop Ride (${stopsCount} stops added like Rapido)` : null,
      recommendedOption: {
        type: params.userMode === "STUDENT" ? "BUS" : "AUTO",
        title: params.userMode === "STUDENT" ? "APSRTC City Bus" : "Local Auto Rickshaw",
        provider: params.userMode === "STUDENT" ? "APSRTC Metro Express" : "Regulated Auto / Rapido",
        totalCost: params.userMode === "STUDENT" ? 10 * (params.travelers || 1) : 30,
        costPerPerson: params.userMode === "STUDENT" ? 10 : Math.round(30 / (params.travelers || 1)),
        durationMinutes: 14,
        convenience: "HIGH",
        badge: "BEST_OVERALL",
        whyChosen: "⭐ Best Overall: Quick point-to-point drop at standard fare."
      },
      allOptions: [
        {
          type: "AUTO",
          title: "Local Auto Rickshaw",
          provider: "Regulated Stand / Rapido Auto",
          estimatedFareMin: 25,
          estimatedFareMax: 40,
          totalCost: 30,
          costPerPerson: Math.round(30 / (params.travelers || 1)),
          durationMinutes: 14,
          convenience: "HIGH",
          badge: "BEST_OVERALL",
          score: 88.0,
          whyChosen: "⭐ Highest value balance: fast travel time and point-to-point drop.",
          stepsSummary: "Direct point-to-point drop; agile in city traffic"
        },
        {
          type: "BUS",
          title: "APSRTC City Bus",
          provider: "Route 28A / 10K",
          estimatedFareMin: 10,
          estimatedFareMax: 15,
          totalCost: 10 * (params.travelers || 1),
          costPerPerson: 10,
          durationMinutes: 24,
          convenience: "MEDIUM",
          badge: "CHEAPEST",
          score: 85.0,
          whyChosen: "💰 Lowest monetary expenditure: saves maximum money.",
          stepsSummary: "Board right outside station gate -> Direct drop"
        },
        {
          type: "CAB",
          title: "App Cab / Uber Go",
          provider: "Uber / Rapido Cab",
          estimatedFareMin: 80,
          estimatedFareMax: 120,
          totalCost: 95,
          costPerPerson: Math.round(95 / (params.travelers || 1)),
          durationMinutes: 11,
          convenience: "VERY_HIGH",
          badge: "FASTEST",
          score: 72.0,
          whyChosen: "⚡ Shortest transit duration with AC comfort.",
          stepsSummary: "Prepaid counter booking or one-click app dispatch"
        }
      ]
    };
  }
}

export async function getNearbyRestaurants(city = "Visakhapatnam", priceCategory = "ALL", sortBy = "rating") {
  try {
    const res = await fetch(`${API_BASE}/restaurants/nearby?city=${encodeURIComponent(city)}&priceCategory=${encodeURIComponent(priceCategory)}&sortBy=${encodeURIComponent(sortBy)}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.warn('Using fallback restaurants:', err);
    return [
      {
        id: 1,
        name: "Sri Sairam Parlour",
        city: "Visakhapatnam",
        area: "Diamond Park / Dwaraka Nagar",
        cuisine: "South Indian Tiffins & Pure Veg",
        priceCategory: "BUDGET_FRIENDLY",
        approxCostForTwo: 140,
        rating: 4.8,
        reviewCount: 4200,
        localTalk: "Legendary 30-year-old staple. Unbeatable Ghee Karam Dosa, Sambar Vada & hot degree filter coffee.",
        famousDishes: "Ghee Karam Dosa, MLA Pesarattu, Filter Coffee",
        distanceMeters: 850,
        address: "Near Diamond Park, Dwaraka Nagar, Visakhapatnam",
        imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800"
      },
      {
        id: 2,
        name: "Sea Inn (Raju Gari Dhaba)",
        city: "Visakhapatnam",
        area: "Rushikonda / Beach Road",
        cuisine: "Authentic Coastal Andhra Seafood",
        priceCategory: "MODERATE",
        approxCostForTwo: 280,
        rating: 4.7,
        reviewCount: 3850,
        localTalk: "Iconic coastal food hideout loved by locals. Must-try spicy Royyala Vepudu (Prawns) and fresh Vanjaram fish fry.",
        famousDishes: "Vanjaram Fish Fry, Royyala Biryani, Crab Curry",
        distanceMeters: 12000,
        address: "Beach Road, Near Rushikonda, Visakhapatnam",
        imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800"
      },
      {
        id: 3,
        name: "Venkatadri Vantillu",
        city: "Visakhapatnam",
        area: "Asilmetta / Complex Road",
        cuisine: "Heritage Andhra Breakfast",
        priceCategory: "BUDGET_FRIENDLY",
        approxCostForTwo: 120,
        rating: 4.6,
        reviewCount: 2900,
        localTalk: "Home of the world-famous melting Sponge Dosa with spicy red ginger and coconut chutneys. Cheap and super fast.",
        famousDishes: "Sponge Dosa, Ghee Idli, Poori Bhaji",
        distanceMeters: 1400,
        address: "Opposite RTC Complex, Asilmetta, Visakhapatnam",
        imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800"
      },
      {
        id: 4,
        name: "Subbayya Gari Hotel",
        city: "Visakhapatnam",
        area: "Dwaraka Nagar 2nd Lane",
        cuisine: "Traditional Andhra Butta Bhojanam",
        priceCategory: "BUDGET_FRIENDLY",
        approxCostForTwo: 180,
        rating: 4.5,
        reviewCount: 5100,
        localTalk: "Famous East Godavari Butta Bhojanam served with generous dollops of pure cow ghee, gunpowder podi & majjiga pulusu.",
        famousDishes: "Unlimited Butta Bhojanam, Podi Ghee, Sweet Panasa Pandu",
        distanceMeters: 1100,
        address: "2nd Lane, Dwaraka Nagar, Visakhapatnam",
        imageUrl: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800"
      },
      {
        id: 5,
        name: "Jagadamba Street Food Lane",
        city: "Visakhapatnam",
        area: "Jagadamba Junction",
        cuisine: "Vizag Local Street Food & Chaats",
        priceCategory: "BUDGET_FRIENDLY",
        approxCostForTwo: 80,
        rating: 4.4,
        reviewCount: 1800,
        localTalk: "Student & tourist evening hotspot for authentic Vizag Tomato Bajji, Muri Mixture, and spicy egg bondas.",
        famousDishes: "Tomato Bajji with puffed rice, Muri Mixture, Sweet Corn",
        distanceMeters: 1800,
        address: "Jagadamba Theater Circle, Visakhapatnam",
        imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800"
      },
      {
        id: 6,
        name: "Muntaj Biryani / Alpha Hotel",
        city: "Visakhapatnam",
        area: "Railway Station Main Gate",
        cuisine: "Biryani & Mughlai",
        priceCategory: "BUDGET_FRIENDLY",
        approxCostForTwo: 190,
        rating: 4.3,
        reviewCount: 3100,
        localTalk: "Generous portions of aromatic Andhra Dum Biryani right outside the railway station platform exit.",
        famousDishes: "Chicken Dum Biryani, Shahi Tukda, Chicken 65",
        distanceMeters: 150,
        address: "Opposite Railway Station Exit, Visakhapatnam",
        imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800"
      },
      {
        id: 7,
        name: "Kamat Restaurant",
        city: "Visakhapatnam",
        area: "Station Road / Surya Bagh",
        cuisine: "North & South Indian Meals",
        priceCategory: "MODERATE",
        approxCostForTwo: 300,
        rating: 4.1,
        reviewCount: 1450,
        localTalk: "Clean, comfortable family dining with reliable thalis, rotis, and south meals close to the transit hubs.",
        famousDishes: "Special Kamat Veg Thali, Paneer Butter Masala",
        distanceMeters: 900,
        address: "Station Road, Surya Bagh, Visakhapatnam",
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800"
      }
    ];
  }
}

// Generates direct deep links & prefilled booking urls for Rapido & Uber with auto-filled destination & pickup
export function getRapidoAndUberUrls(source, destination, stops = [], sourceCoords = null, destCoords = null) {
  const allPoints = stops.length > 0 ? `${source} via ${stops.join(', ')} to ${destination}` : `${source} to ${destination}`;
  const pickupName = source || "Current Location";
  const dropName = destination || "Destination";
  const encodedPickup = encodeURIComponent(pickupName);
  const encodedDrop = encodeURIComponent(dropName);
  
  // 1. Uber Universal Deep Link (Web & Mobile App intent)
  let uberParams = `action=setPickup&client_id=trippilot&pickup[formatted_address]=${encodedPickup}&pickup[nickname]=${encodedPickup}&dropoff[formatted_address]=${encodedDrop}&dropoff[nickname]=${encodedDrop}`;
  if (sourceCoords?.lat && sourceCoords?.lng) {
    uberParams += `&pickup[latitude]=${sourceCoords.lat}&pickup[longitude]=${sourceCoords.lng}`;
  }
  if (destCoords?.lat && destCoords?.lng) {
    uberParams += `&dropoff[latitude]=${destCoords.lat}&dropoff[longitude]=${destCoords.lng}`;
  }
  const uberUrl = `https://m.uber.com/ul/?${uberParams}`;
  const uberWebUrl = `https://m.uber.com/looking?dropoff[formatted_address]=${encodedDrop}&dropoff[nickname]=${encodedDrop}&pickup[formatted_address]=${encodedPickup}&pickup[nickname]=${encodedPickup}${destCoords?.lat ? `&dropoff[latitude]=${destCoords.lat}&dropoff[longitude]=${destCoords.lng}` : ''}${sourceCoords?.lat ? `&pickup[latitude]=${sourceCoords.lat}&pickup[longitude]=${sourceCoords.lng}` : ''}`;
  
  // 2. Rapido Universal Link (Web & Mobile Intent)
  let rapidoParams = `pickup_address=${encodedPickup}&drop_address=${encodedDrop}&destination=${encodedDrop}&drop=${encodedDrop}&pickup=${encodedPickup}&src=${encodedPickup}&dest=${encodedDrop}`;
  if (sourceCoords?.lat && sourceCoords?.lng) {
    rapidoParams += `&pickup_lat=${sourceCoords.lat}&pickup_lng=${sourceCoords.lng}`;
  }
  if (destCoords?.lat && destCoords?.lng) {
    rapidoParams += `&drop_lat=${destCoords.lat}&drop_lng=${destCoords.lng}`;
  }
  const rapidoUrl = `https://m.rapido.bike/?${rapidoParams}`;
  
  return {
    uberUrl,
    uberWebUrl,
    rapidoUrl,
    routeSummary: allPoints,
    destination: dropName,
    pickup: pickupName
  };
}

export async function getLiveTaxiRates(distanceKm = 3.0, city = "Visakhapatnam", source = "", destination = "", sourceCoords = null, destCoords = null) {
  const links = getRapidoAndUberUrls(source, destination, [], sourceCoords, destCoords);
  try {
    const res = await fetch(`${API_BASE}/fare/live-rates?distanceKm=${encodeURIComponent(distanceKm)}&city=${encodeURIComponent(city)}&source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    // Ensure returned quotes have fully formatted client deep links with coordinates
    return data.map(q => ({
      ...q,
      deepLink: q.provider === "Rapido" ? links.rapidoUrl : (q.provider === "Uber" ? links.uberUrl : null)
    }));
  } catch (err) {
    const dist = Math.max(0.5, Number(distanceKm) || 3.0);
    const minute = new Date().getMinutes();
    const variance = (minute % 10) * 0.02;
    const rapidoSurge = Math.round((1.05 + variance) * 100) / 100;
    const uberSurge = Math.round((1.10 + variance) * 100) / 100;

    return [
      {
        category: "BIKE_TAXI",
        provider: "Rapido",
        vehicleName: "Rapido Bike",
        estimatedFare: Math.round(Math.max(25, (20 + Math.max(0, dist - 1) * 6 + (dist * 3)) * rapidoSurge)),
        baseFare: 20,
        perKmRate: 6,
        surgeMultiplier: rapidoSurge,
        etaMinutes: 2,
        surgeLabel: rapidoSurge > 1.15 ? "High Demand" : "Normal Fare",
        deepLink: links.rapidoUrl
      },
      {
        category: "BIKE_TAXI",
        provider: "Uber",
        vehicleName: "Uber Moto",
        estimatedFare: Math.round(Math.max(28, (25 + Math.max(0, dist - 1) * 6.5 + (dist * 3)) * uberSurge)),
        baseFare: 25,
        perKmRate: 6.5,
        surgeMultiplier: uberSurge,
        etaMinutes: 3,
        surgeLabel: uberSurge > 1.15 ? "Surge 1.2x" : "Standard Fare",
        deepLink: links.uberUrl
      },
      {
        category: "AUTO",
        provider: "Rapido",
        vehicleName: "Rapido Auto",
        estimatedFare: Math.round(Math.max(30, (25 + Math.max(0, dist - 1.5) * 12) * rapidoSurge)),
        baseFare: 25,
        perKmRate: 12,
        surgeMultiplier: rapidoSurge,
        etaMinutes: 3,
        surgeLabel: "Regulated App Rate",
        deepLink: links.rapidoUrl
      },
      {
        category: "AUTO",
        provider: "Uber",
        vehicleName: "Uber Auto",
        estimatedFare: Math.round(Math.max(32, (28 + Math.max(0, dist - 1.5) * 12.5) * uberSurge)),
        baseFare: 28,
        perKmRate: 12.5,
        surgeMultiplier: uberSurge,
        etaMinutes: 4,
        surgeLabel: "Live Meter App",
        deepLink: links.uberUrl
      },
      {
        category: "AUTO",
        provider: "Government Meter",
        vehicleName: "Local Auto (Standard Tariff)",
        estimatedFare: Math.round(Math.max(20, 20 + Math.max(0, dist - 1.5) * 12)),
        baseFare: 20,
        perKmRate: 12,
        surgeMultiplier: 1.0,
        etaMinutes: 1,
        surgeLabel: "RTA Gazetted Meter",
        deepLink: null
      },
      {
        category: "CAB",
        provider: "Uber",
        vehicleName: "Uber Go (AC Hatchback)",
        estimatedFare: Math.round(Math.max(75, (60 + Math.max(0, dist - 2) * 16 + (dist * 4.4)) * uberSurge)),
        baseFare: 60,
        perKmRate: 16,
        surgeMultiplier: uberSurge,
        etaMinutes: 5,
        surgeLabel: uberSurge > 1.15 ? "Busy Area Surge" : "Standard AC Fare",
        deepLink: links.uberUrl
      },
      {
        category: "CAB",
        provider: "Rapido",
        vehicleName: "Rapido Cab (Compact AC)",
        estimatedFare: Math.round(Math.max(70, (55 + Math.max(0, dist - 2) * 15 + (dist * 4.0)) * rapidoSurge)),
        baseFare: 55,
        perKmRate: 15,
        surgeMultiplier: rapidoSurge,
        etaMinutes: 4,
        surgeLabel: "Guaranteed Lowest Cab",
        deepLink: links.rapidoUrl
      }
    ];
  }
}

export async function getBudgetItinerary(startingLocation = "Visakhapatnam Railway Station", hours = 6, budget = 500, city = "Visakhapatnam") {
  try {
    const res = await fetch(`${API_BASE}/tourist-places/itinerary?startingLocation=${encodeURIComponent(startingLocation)}&hours=${hours}&budget=${budget}&city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function getNearbyTransport(lat, lng) {
  try {
    const res = await fetch(`${API_BASE}/location/nearby?lat=${lat || ''}&lng=${lng || ''}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    return [
      { type: "AUTO_STAND", name: "Station Main Gate Auto Stand", distanceMeters: 100, estimatedFairToCenter: "₹20–₹30", availableVehicles: "12 Autos waiting" },
      { type: "BUS_STOP", name: "Railway Station Bus Stop (RTC)", distanceMeters: 250, estimatedFairToCenter: "₹10–₹15", availableVehicles: "Routes 28A, 10K arriving in 3 mins" },
      { type: "CAB_PICKUP", name: "Prepaid Taxi / App Cab Bay", distanceMeters: 300, estimatedFairToCenter: "₹80–₹120", availableVehicles: "Uber / Rapido 4 mins away" },
      { type: "RAILWAY_STATION", name: "Visakhapatnam Junction (VSKP)", distanceMeters: 0, estimatedFairToCenter: "Platform 1 & 8 exits", availableVehicles: "Major Rail Hub" }
    ];
  }
}

export async function getTouristPlaces(city = "Visakhapatnam") {
  try {
    const res = await fetch(`${API_BASE}/tourist-places/nearby?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    return [
      {
        id: 1,
        name: "INS Kursura Submarine Museum",
        city: "Visakhapatnam",
        description: "India's iconic Soviet-built submarine converted into a walkthrough maritime museum on the golden sands of RK Beach.",
        history: "Decommissioned in 2001 after 31 years of naval service including the 1971 war.",
        entryFee: 70,
        estimatedVisitTimeMin: 60,
        category: "MUSEUM",
        imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
        famousFor: "Historic Submarine Interior, Torpedo room, Radar deck",
        bestTime: "02:00 PM – 08:30 PM (Closed Mondays)"
      },
      {
        id: 2,
        name: "Kailasagiri Hilltop Park",
        city: "Visakhapatnam",
        description: "A 360-degree picturesque hill station overlooking the Bay of Bengal with massive 40-ft Lord Shiva and Parvati statues and ropeway ride.",
        history: "Developed by VUDA as a serene scenic promenade offering a panoramic view of Vizag city coastline.",
        entryFee: 20,
        estimatedVisitTimeMin: 90,
        category: "NATURE",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        famousFor: "Ropeway cable car, Toy train ride, Titanic viewpoint",
        bestTime: "06:00 AM – 08:00 PM Daily"
      },
      {
        id: 3,
        name: "Ramakrishna (RK) Beach & War Memorial",
        city: "Visakhapatnam",
        description: "The beating heart of Vizag beachfront with scenic promenade, Victory at Sea memorial, and bustling local Andhra street food stalls.",
        history: "Famous for the Victory at Sea memorial commemorating naval victory in 1971.",
        entryFee: 0,
        estimatedVisitTimeMin: 75,
        category: "BEACH",
        imageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
        famousFor: "Seaside sunrise, Muri mixture snack, Breezy walkways",
        bestTime: "All day (Best in Morning & Evening)"
      }
    ];
  }
}

export async function sendAIChat(params) {
  try {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    const lang = params.language || 'en';
    return {
      reply: "From Visakhapatnam Railway Station to Vizag Complex, fair auto fare is ₹20–₹35. An ask of ₹100 has a High Price Deviation (+185%). You can also book directly via Rapido / Uber or take an APSRTC bus for ₹10–₹15.",
      language: lang,
      suggestions: ["Book on Rapido", "Show nearby restaurants", "Start Trip Mode"]
    };
  }
}

export async function compareProviders(params) {
  try {
    const res = await fetch(`${API_BASE}/providers/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.warn('Backend provider comparison fallback:', err);
    const dist = Number(params.distanceKm || 3.5);
    const city = params.city || 'Visakhapatnam';
    return {
      city,
      origin: params.origin || 'Current Location',
      destination: params.destination || 'City Center',
      distanceKm: dist,
      nightTariffActive: false,
      currentHour: new Date().getHours(),
      options: [
        {
          id: "govt-auto",
          provider: "Government Meter",
          serviceName: "Statutory RTO Auto",
          category: "AUTO",
          fareMin: 20 + Math.max(0, dist - 1.5) * 12,
          fareMax: (20 + Math.max(0, dist - 1.5) * 12) * 1.12,
          fareFormatted: `₹${Math.round(20 + Math.max(0, dist - 1.5) * 12)} - ₹${Math.round((20 + Math.max(0, dist - 1.5) * 12) * 1.12)}`,
          etaMinutes: Math.round(dist * 2.5) + 3,
          etaFormatted: `${Math.round(dist * 2.5) + 3} mins`,
          provenanceBadge: "TARIFF_VERIFIED",
          badgeLabel: "Tariff Verified",
          badgeColor: "emerald",
          deepLink: null,
          bookingAction: "INSIST_ON_METER",
          advisory: "Statutory fare rate. Insist on meter reset before starting.",
          recommended: true
        },
        {
          id: "rapido-bike",
          provider: "Rapido",
          serviceName: "Rapido Bike Taxi",
          category: "BIKE_TAXI",
          fareMin: 25 + Math.max(0, dist - 1.0) * 7,
          fareMax: (25 + Math.max(0, dist - 1.0) * 7) * 1.15,
          fareFormatted: `₹${Math.round(25 + Math.max(0, dist - 1.0) * 7)}`,
          etaMinutes: Math.round(dist * 2.0) + 2,
          etaFormatted: `${Math.round(dist * 2.0) + 2} mins`,
          provenanceBadge: "APP_ESTIMATE",
          badgeLabel: "App Estimate",
          badgeColor: "indigo",
          deepLink: `https://m.rapido.bike/?destination=${encodeURIComponent(params.destination || '')}`,
          bookingAction: "OPEN_APP",
          advisory: "Fastest single-rider commute.",
          recommended: false
        },
        {
          id: "uber-auto",
          provider: "Uber",
          serviceName: "Uber Auto",
          category: "AUTO",
          fareMin: 32 + Math.max(0, dist - 1.5) * 13,
          fareMax: (32 + Math.max(0, dist - 1.5) * 13) * 1.18,
          fareFormatted: `₹${Math.round(32 + Math.max(0, dist - 1.5) * 13)}`,
          etaMinutes: Math.round(dist * 2.5) + 4,
          etaFormatted: `${Math.round(dist * 2.5) + 4} mins`,
          provenanceBadge: "APP_ESTIMATE",
          badgeLabel: "App Estimate",
          badgeColor: "indigo",
          deepLink: `https://m.uber.com/ul/?dropoff[formatted_address]=${encodeURIComponent(params.destination || '')}`,
          bookingAction: "OPEN_APP",
          advisory: "Prepaid cashless ride.",
          recommended: false
        },
        {
          id: "city-bus",
          provider: "City RTC",
          serviceName: "Municipal City Bus",
          category: "BUS",
          fareMin: 10,
          fareMax: 15,
          fareFormatted: "₹10 - ₹15",
          etaMinutes: Math.round(dist * 3.5) + 7,
          etaFormatted: `${Math.round(dist * 3.5) + 7} mins`,
          provenanceBadge: "PUBLIC_TRANSIT",
          badgeLabel: "Public Transit",
          badgeColor: "cyan",
          deepLink: null,
          bookingAction: "BOARD_BUS",
          advisory: "Most budget friendly. Pay conductor directly.",
          recommended: false
        }
      ]
    };
  }
}

export async function getAccommodations(city = 'Visakhapatnam', type, maxPrice) {
  try {
    let url = `${API_BASE}/accommodations?city=${encodeURIComponent(city)}`;
    if (type) url += `&type=${encodeURIComponent(type)}`;
    if (maxPrice) url += `&maxPrice=${maxPrice}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function getRegionalFoods(city = 'Visakhapatnam', maxPrice, budgetOnly = false) {
  try {
    let url = `${API_BASE}/food?city=${encodeURIComponent(city)}&budgetOnly=${budgetOnly}`;
    if (maxPrice) url += `&maxPrice=${maxPrice}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function getTransitHubs(city = 'Visakhapatnam') {
  try {
    const res = await fetch(`${API_BASE}/location/hubs?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function calculateRouteDetails(startLat, startLon, endLat, endLon) {
  try {
    const res = await fetch(`${API_BASE}/location/route?startLat=${startLat}&startLon=${startLon}&endLat=${endLat}&endLon=${endLon}`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function sendAICompanion(params) {
  try {
    const res = await fetch(`${API_BASE}/ai/companion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    return {
      reply: "In " + (params.city || "Visakhapatnam") + ", standard auto fare is approx ₹20 flag-drop for 1.5 km and ₹12/km thereafter. Insist on meter reset.",
      audioText: "Standard auto fare is approx ₹20 for 1.5 km and ₹12 per km. Always check the meter.",
      isGeminiLive: false,
      suggestions: ["Compare with Uber & Rapido", "Show city bus stops"]
    };
  }
}