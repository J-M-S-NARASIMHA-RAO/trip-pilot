import { loadGoogleMaps } from './googleMapsService';

// In-memory cache for instant photo retrieval
const photoMemoryCache = new Map();

/**
 * Curated high-resolution fallback photos categorized by landmark / travel keywords
 */
const CATEGORY_FALLBACK_IMAGES = {
  beach: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
  ],
  temple: [
    "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=800",
    "https://images.unsplash.com/photo-1620619767323-b95a89183081?w=800",
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800"
  ],
  station: [
    "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800",
    "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800",
    "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800"
  ],
  airport: [
    "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800",
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800"
  ],
  park: [
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
    "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800"
  ],
  museum: [
    "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800",
    "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800"
  ],
  hotel: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
  ],
  food: [
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800",
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800"
  ],
  city: [
    "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800",
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800",
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800"
  ]
};

/**
 * Known prominent real-world landmarks with direct high-res imagery
 */
const KNOWN_LANDMARK_PHOTOS = {
  "rk beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  "ramakrishna beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  "kailasagiri": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
  "rushikonda": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
  "ins kursura": "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800",
  "submarine museum": "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800",
  "simhachalam": "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=800",
  "visakhapatnam railway station": "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800",
  "vizag rtc complex": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
  "dwaraka bus": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
  "charminar": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
  "golconda fort": "https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=800",
  "hussain sagar": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800",
  "lalbagh": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
  "india gate": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
  "gateway of india": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800",
  "taj mahal": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800",
  "eiffel tower": "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800",
  "times square": "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800"
};

/**
 * Fetches Wikipedia / Wikimedia Commons summary photo for any real-world place
 */
async function fetchWikipediaPhoto(query) {
  try {
    const cleanQuery = encodeURIComponent(query.trim());
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${cleanQuery}`);
    if (res.ok) {
      const data = await res.json();
      if (data.thumbnail?.source) {
        return data.originalimage?.source || data.thumbnail.source.replace(/\/\d+px-/, '/800px-');
      }
    }
  } catch (err) {
    // Silent catch, proceed to next strategy
  }
  return null;
}

/**
 * Searches Google Places API for photo of a location query using active Google Maps instance
 */
async function fetchGooglePlacesPhoto(query) {
  try {
    const google = await loadGoogleMaps();
    if (!google?.maps?.places?.PlacesService) return null;

    const dummyDiv = document.createElement('div');
    const service = new google.maps.places.PlacesService(dummyDiv);

    return new Promise((resolve) => {
      service.findPlaceFromQuery(
        {
          query: query,
          fields: ['name', 'photos', 'formatted_address', 'place_id']
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const place = results[0];
            if (place.photos && place.photos.length > 0) {
              try {
                const photoUrl = place.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
                resolve(photoUrl);
                return;
              } catch (e) {
                // fall through
              }
            }
          }
          resolve(null);
        }
      );
    });
  } catch (err) {
    return null;
  }
}

/**
 * Main exported function to get high-quality photo of any real-world location
 * 
 * @param {string} placeName - Name or address of the destination
 * @param {string} placeId - Optional Google Place ID
 * @param {string} city - Optional city context
 * @returns {Promise<string>} Image URL
 */
export async function getLocationPhoto(placeName, placeId = null, city = "") {
  if (!placeName || placeName.trim().length === 0) {
    return CATEGORY_FALLBACK_IMAGES.city[0];
  }

  const queryKey = (placeName + " " + (city || "")).toLowerCase().trim();

  // 1. Check in-memory cache
  if (photoMemoryCache.has(queryKey)) {
    return photoMemoryCache.get(queryKey);
  }

  // 2. Check localStorage cache
  try {
    const stored = localStorage.getItem(`tp_photo_${queryKey}`);
    if (stored) {
      photoMemoryCache.set(queryKey, stored);
      return stored;
    }
  } catch (e) {
    // LocalStorage quota or access error
  }

  // 3. Check known landmark dictionary
  for (const [key, photoUrl] of Object.entries(KNOWN_LANDMARK_PHOTOS)) {
    if (queryKey.includes(key)) {
      photoMemoryCache.set(queryKey, photoUrl);
      return photoUrl;
    }
  }

  let resolvedPhoto = null;

  // 4. Try Google Places Photo API
  try {
    resolvedPhoto = await fetchGooglePlacesPhoto(placeName + (city ? ` ${city}` : ''));
  } catch (e) {
    // Continue to next fallback
  }

  // 5. Try Wikipedia / Wikimedia Commons API
  if (!resolvedPhoto) {
    const tokens = placeName.split(',')[0].trim();
    resolvedPhoto = await fetchWikipediaPhoto(tokens);
    if (!resolvedPhoto && city) {
      resolvedPhoto = await fetchWikipediaPhoto(`${tokens} ${city}`);
    }
  }

  // 6. Category-based fallback
  if (!resolvedPhoto) {
    const lower = queryKey.toLowerCase();
    if (lower.includes('beach') || lower.includes('sea') || lower.includes('coast')) {
      resolvedPhoto = CATEGORY_FALLBACK_IMAGES.beach[Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES.beach.length)];
    } else if (lower.includes('temple') || lower.includes('mandir') || lower.includes('church') || lower.includes('mosque') || lower.includes('shrine')) {
      resolvedPhoto = CATEGORY_FALLBACK_IMAGES.temple[Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES.temple.length)];
    } else if (lower.includes('station') || lower.includes('railway') || lower.includes('train') || lower.includes('junction') || lower.includes('metro')) {
      resolvedPhoto = CATEGORY_FALLBACK_IMAGES.station[Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES.station.length)];
    } else if (lower.includes('airport') || lower.includes('terminal') || lower.includes('air')) {
      resolvedPhoto = CATEGORY_FALLBACK_IMAGES.airport[Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES.airport.length)];
    } else if (lower.includes('park') || lower.includes('garden') || lower.includes('hill') || lower.includes('zoo') || lower.includes('lake')) {
      resolvedPhoto = CATEGORY_FALLBACK_IMAGES.park[Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES.park.length)];
    } else if (lower.includes('museum') || lower.includes('fort') || lower.includes('palace') || lower.includes('monument')) {
      resolvedPhoto = CATEGORY_FALLBACK_IMAGES.museum[Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES.museum.length)];
    } else if (lower.includes('hotel') || lower.includes('resort') || lower.includes('stay') || lower.includes('inn') || lower.includes('lodge')) {
      resolvedPhoto = CATEGORY_FALLBACK_IMAGES.hotel[Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES.hotel.length)];
    } else if (lower.includes('parlour') || lower.includes('restaurant') || lower.includes('food') || lower.includes('cafe') || lower.includes('dhaba') || lower.includes('biryani')) {
      resolvedPhoto = CATEGORY_FALLBACK_IMAGES.food[Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES.food.length)];
    } else {
      resolvedPhoto = CATEGORY_FALLBACK_IMAGES.city[Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES.city.length)];
    }
  }

  // Cache photo for instant loading next time
  photoMemoryCache.set(queryKey, resolvedPhoto);
  try {
    localStorage.setItem(`tp_photo_${queryKey}`, resolvedPhoto);
  } catch (e) {
    // quota exceeded, ignore
  }

  return resolvedPhoto;
}
