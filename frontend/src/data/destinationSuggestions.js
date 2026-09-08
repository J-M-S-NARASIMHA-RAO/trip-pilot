/**
 * Trip Pilot Live Location Destination Suggestions Database
 * Provides curated popular destinations, landmarks, transit hubs, and attractions
 * for the user's detected live location / city with GPS coordinates and real-time distance.
 */

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const CITY_DESTINATIONS = {
  Visakhapatnam: [
    {
      id: 'vskp-rk-beach',
      name: 'RK Beach (Ramakrishna Beach)',
      relativeName: 'RK Beach, Beach Road',
      category: 'Beach & Promenade',
      emoji: '🏖️',
      lat: 17.7144,
      lng: 83.3235,
      address: 'Ramakrishna Beach Road, Pandurangapuram, Visakhapatnam 530003',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800'
    },
    {
      id: 'vskp-kailasagiri',
      name: 'Kailasagiri Hilltop Park',
      relativeName: 'Kailasagiri Hilltop, Ropeway Point',
      category: 'Scenic Viewpoint',
      emoji: '🚡',
      lat: 17.7492,
      lng: 83.3422,
      address: 'Hill Top Road, Kailasagiri, Visakhapatnam 530043',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
    },
    {
      id: 'vskp-simhachalam',
      name: 'Simhachalam Temple',
      relativeName: 'Simhachalam Temple, Hill Shrine',
      category: 'Spiritual / Heritage',
      emoji: '🛕',
      lat: 17.7665,
      lng: 83.2505,
      address: 'Simhachalam, Visakhapatnam 530028',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'
    },
    {
      id: 'vskp-rushikonda',
      name: 'Rushikonda Beach & IT SEZ',
      relativeName: 'Rushikonda Blue Flag Beach',
      category: 'Water Sports & IT Hub',
      emoji: '🌊',
      lat: 17.7818,
      lng: 83.3855,
      address: 'Rushikonda, Bheemili Road, Visakhapatnam 530045',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'
    },
    {
      id: 'vskp-rtc-complex',
      name: 'RTC Complex / Dwaraka Bus Station',
      relativeName: 'RTC Complex, Dwaraka Nagar',
      category: 'Central Transit Hub',
      emoji: '🏢',
      lat: 17.7275,
      lng: 83.3090,
      address: 'Dwaraka Nagar, Visakhapatnam 530016',
      rating: 4.3,
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'
    },
    {
      id: 'vskp-jagadamba',
      name: 'Jagadamba Junction / Central Mall',
      relativeName: 'Jagadamba Centre, Main Market',
      category: 'Shopping & Cinema',
      emoji: '🎬',
      lat: 17.7128,
      lng: 83.3023,
      address: 'Jagadamba Junction, Visakhapatnam 530002',
      rating: 4.4,
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
    },
    {
      id: 'vskp-kursura',
      name: 'INS Kursura Submarine Museum',
      relativeName: 'Kursura Submarine Museum, RK Beach',
      category: 'Museum & War Memorial',
      emoji: '⚓',
      lat: 17.7172,
      lng: 83.3315,
      address: 'Beach Road, Kirlampudi Layout, Visakhapatnam 530017',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'
    },
    {
      id: 'vskp-station',
      name: 'Visakhapatnam Railway Station',
      relativeName: 'Vizag Rly Station, Platform 1',
      category: 'Railway Terminus',
      emoji: '🚂',
      lat: 17.7214,
      lng: 83.2929,
      address: 'Railway Quarters, Visakhapatnam 530004',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800'
    },
    {
      id: 'vskp-gajuwaka',
      name: 'Gajuwaka Junction',
      relativeName: 'Gajuwaka Junction, Main Road',
      category: 'Commercial & Industrial Hub',
      emoji: '🏬',
      lat: 17.6908,
      lng: 83.2104,
      address: 'Gajuwaka Main Road, Visakhapatnam 530026',
      rating: 4.4,
      imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800'
    },
    {
      id: 'vskp-nad',
      name: 'NAD Junction / Flyover',
      relativeName: 'NAD Junction, Gopalapatnam Road',
      category: 'Transit Intersection',
      emoji: '🚏',
      lat: 17.7410,
      lng: 83.2312,
      address: "NAD 'X' Junction, Visakhapatnam 530009",
      rating: 4.3,
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'
    },
    {
      id: 'vskp-mvp',
      name: 'MVP Colony / Double Road',
      relativeName: 'MVP Colony Circle, Sector 1',
      category: 'Residential & Cafes',
      emoji: '☕',
      lat: 17.7394,
      lng: 83.3328,
      address: 'MVP Double Road, Visakhapatnam 530017',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
    },
    {
      id: 'vskp-siripuram',
      name: 'Siripuram Junction',
      relativeName: 'Siripuram Circle, Dutt Island',
      category: 'City Centre & Commercial',
      emoji: '🏢',
      lat: 17.7227,
      lng: 83.3152,
      address: 'Siripuram, Waltair Uplands, Visakhapatnam 530003',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
    },
    {
      id: 'vskp-airport',
      name: 'Visakhapatnam Airport (VTZ)',
      relativeName: 'Visakhapatnam International Airport',
      category: 'Airport Terminal',
      emoji: '✈️',
      lat: 17.7211,
      lng: 83.2245,
      address: 'NAD Junction, Visakhapatnam 530009',
      rating: 4.4,
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'
    }
  ],

  Hyderabad: [
    {
      id: 'hyd-charminar',
      name: 'Charminar & Laad Bazaar',
      relativeName: 'Charminar, Old City',
      category: 'Historic Monument',
      emoji: '🕌',
      lat: 17.3616,
      lng: 78.4747,
      address: 'Char Kaman, Ghansi Bazaar, Hyderabad 500002',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1572455857811-045fb4255b5d?w=800'
    },
    {
      id: 'hyd-hitec-city',
      name: 'Hitec City / Cyber Towers',
      relativeName: 'Cyber Towers, Hitec City',
      category: 'Tech Corridor',
      emoji: '💻',
      lat: 17.4504,
      lng: 78.3808,
      address: 'Hitec City Main Road, Madhapur, Hyderabad 500081',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'
    },
    {
      id: 'hyd-golconda',
      name: 'Golconda Fort',
      relativeName: 'Golconda Fort, Ibrahim Bagh',
      category: 'Heritage Citadel',
      emoji: '🏰',
      lat: 17.3833,
      lng: 78.4011,
      address: 'Khair Complex, Golconda, Hyderabad 500008',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800'
    },
    {
      id: 'hyd-hussain-sagar',
      name: 'Hussain Sagar Lake & Tank Bund',
      relativeName: 'Tank Bund, Buddha Statue Point',
      category: 'Scenic Waterfront',
      emoji: '🌳',
      lat: 17.4239,
      lng: 78.4738,
      address: 'Tank Bund Road, Hyderabad 500004',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
    },
    {
      id: 'hyd-dlf',
      name: 'DLF Cybercity Food Street',
      relativeName: 'DLF Food Street, Gachibowli',
      category: 'Night Street Food',
      emoji: '🍲',
      lat: 17.4483,
      lng: 78.3587,
      address: 'Gachibowli, Hyderabad 500032',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
    },
    {
      id: 'hyd-secunderabad',
      name: 'Secunderabad Railway Station',
      relativeName: 'Secunderabad Junction, Platform 10',
      category: 'Railway Hub',
      emoji: '🚂',
      lat: 17.4344,
      lng: 78.5013,
      address: 'Station Road, Secunderabad 500003',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800'
    },
    {
      id: 'hyd-banjara',
      name: 'Banjara Hills Road No. 1',
      relativeName: 'Banjara Hills, City Centre Mall',
      category: 'Shopping & Dining',
      emoji: '🛍️',
      lat: 17.4156,
      lng: 78.4487,
      address: 'Road No. 1, Banjara Hills, Hyderabad 500034',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
    },
    {
      id: 'hyd-rgia',
      name: 'RGIA Airport Shamshabad',
      relativeName: 'Rajiv Gandhi Int\'l Airport (RGIA)',
      category: 'International Airport',
      emoji: '✈️',
      lat: 17.2403,
      lng: 78.4294,
      address: 'Shamshabad, Hyderabad 500409',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'
    }
  ],

  Bengaluru: [
    {
      id: 'blr-vidhana',
      name: 'Vidhana Soudha & Cubbon Park',
      relativeName: 'Vidhana Soudha, Central Hub',
      category: 'State Landmark',
      emoji: '🏛️',
      lat: 12.9797,
      lng: 77.5907,
      address: 'Dr Ambedkar Veedhi, Sampangi Rama Nagara, Bengaluru 560001',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'
    },
    {
      id: 'blr-lalbagh',
      name: 'Lalbagh Botanical Garden',
      relativeName: 'Lalbagh Glass House, South Gate',
      category: 'Botanical Heritage',
      emoji: '🌳',
      lat: 12.9507,
      lng: 77.5848,
      address: 'Mavalli, Bengaluru 560004',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
    },
    {
      id: 'blr-indiranagar',
      name: 'Indiranagar 100 Feet Road',
      relativeName: '100 Feet Road, Indiranagar',
      category: 'Cafes & Nightlife',
      emoji: '☕',
      lat: 12.9719,
      lng: 77.6412,
      address: 'Indiranagar, Bengaluru 560038',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
    },
    {
      id: 'blr-whitefield',
      name: 'Whitefield ITPL Tech Park',
      relativeName: 'ITPL Main Gate, Whitefield',
      category: 'IT Tech Zone',
      emoji: '💻',
      lat: 12.9868,
      lng: 77.7381,
      address: 'ITPB, Whitefield, Bengaluru 560066',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'
    },
    {
      id: 'blr-majestic',
      name: 'KSR Bengaluru Station (Majestic)',
      relativeName: 'KSR Bengaluru Majestic Station',
      category: 'Central Transit Hub',
      emoji: '🚂',
      lat: 12.9774,
      lng: 77.5729,
      address: 'Kempegowda, Sevashrama, Bengaluru 560023',
      rating: 4.3,
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800'
    },
    {
      id: 'blr-airport',
      name: 'Kempegowda Airport (BLR)',
      relativeName: 'Kempegowda Int\'l Airport, Terminal 1/2',
      category: 'International Airport',
      emoji: '✈️',
      lat: 13.1986,
      lng: 77.7066,
      address: 'Devanahalli, Bengaluru 560300',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'
    }
  ],

  Delhi: [
    {
      id: 'del-india-gate',
      name: 'India Gate & Kartavya Path',
      relativeName: 'India Gate, Central Vista',
      category: 'National Monument',
      emoji: '🏛️',
      lat: 28.6129,
      lng: 77.2295,
      address: 'Rajpath, India Gate, New Delhi 110001',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'
    },
    {
      id: 'del-cp',
      name: 'Connaught Place (CP)',
      relativeName: 'Connaught Place, Rajiv Chowk',
      category: 'Commercial Hub',
      emoji: '⭕',
      lat: 28.6315,
      lng: 77.2167,
      address: 'Connaught Place, New Delhi 110001',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
    },
    {
      id: 'del-red-fort',
      name: 'Red Fort & Chandni Chowk',
      relativeName: 'Red Fort (Lal Qila), Chandni Chowk',
      category: 'Mughal Heritage',
      emoji: '🏰',
      lat: 28.6562,
      lng: 77.2410,
      address: 'Netaji Subhash Marg, Lal Qila, Chandni Chowk, Delhi 110006',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800'
    },
    {
      id: 'del-ndls',
      name: 'New Delhi Railway Station (NDLS)',
      relativeName: 'NDLS Station, Paharganj Gate',
      category: 'Railway Hub',
      emoji: '🚂',
      lat: 28.6429,
      lng: 77.2195,
      address: 'Bhavbhuti Marg, Ratan Lal Market, Kamla Market, Delhi 110006',
      rating: 4.2,
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800'
    },
    {
      id: 'del-igi',
      name: 'IGI Airport Terminal 3',
      relativeName: 'Indira Gandhi Int\'l Airport T3',
      category: 'International Airport',
      emoji: '✈️',
      lat: 28.5562,
      lng: 77.1000,
      address: 'Palam, New Delhi 110037',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'
    }
  ],

  Mumbai: [
    {
      id: 'mum-gateway',
      name: 'Gateway of India',
      relativeName: 'Gateway of India, Colaba',
      category: 'Iconic Landmark',
      emoji: '🏛️',
      lat: 18.9220,
      lng: 72.8347,
      address: 'Apollo Bandar, Colaba, Mumbai 400001',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800'
    },
    {
      id: 'mum-marine-drive',
      name: 'Marine Drive Promenade',
      relativeName: 'Marine Drive (Queen\'s Necklace)',
      category: 'Sea Promenade',
      emoji: '🌊',
      lat: 18.9432,
      lng: 72.8234,
      address: 'Netaji Subhash Chandra Bose Road, Mumbai 400020',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800'
    },
    {
      id: 'mum-bkc',
      name: 'Bandra Kurla Complex (BKC)',
      relativeName: 'BKC Financial Center, Bandra',
      category: 'Financial District',
      emoji: '💼',
      lat: 19.0657,
      lng: 72.8687,
      address: 'Bandra Kurla Complex, Bandra East, Mumbai 400051',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'
    },
    {
      id: 'mum-csmt',
      name: 'CSMT Railway Terminus',
      relativeName: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
      category: 'UNESCO Railway Station',
      emoji: '🚂',
      lat: 18.9398,
      lng: 72.8355,
      address: 'Fort, Mumbai 400001',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800'
    },
    {
      id: 'mum-bom',
      name: 'Mumbai Airport (CSMIA T2)',
      relativeName: 'Chhatrapati Shivaji Maharaj Airport T2',
      category: 'International Airport',
      emoji: '✈️',
      lat: 19.0896,
      lng: 72.8656,
      address: 'Sahar Village, Andheri East, Mumbai 400099',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'
    }
  ],

  Vijayawada: [
    {
      id: 'vja-kanakadurga',
      name: 'Kanaka Durga Temple',
      relativeName: 'Kanaka Durga Temple, Indrakeeladri',
      category: 'Spiritual Shrine',
      emoji: '🛕',
      lat: 16.5167,
      lng: 80.6056,
      address: 'Indrakeeladri, Mallikarjunapeta, Vijayawada 520001',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'
    },
    {
      id: 'vja-prakasam',
      name: 'Prakasam Barrage & Bhavani Island',
      relativeName: 'Prakasam Barrage, Krishna River',
      category: 'Riverfront & Barrage',
      emoji: '🌊',
      lat: 16.5064,
      lng: 80.6053,
      address: 'Krishna River, Vijayawada 520001',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
    },
    {
      id: 'vja-pnbs',
      name: 'PNBS Central Bus Station',
      relativeName: 'Pandit Nehru Bus Station (PNBS)',
      category: 'Central Bus Terminal',
      emoji: '🏢',
      lat: 16.5085,
      lng: 80.6200,
      address: 'PNBS Complex, Vijayawada 520013',
      rating: 4.3,
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'
    },
    {
      id: 'vja-station',
      name: 'Vijayawada Junction Railway Station',
      relativeName: 'Vijayawada Junction, Platform 1',
      category: 'Railway Hub',
      emoji: '🚂',
      lat: 16.5175,
      lng: 80.6205,
      address: 'Railway Colony, Vijayawada 520001',
      rating: 4.4,
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800'
    }
  ],

  Jaipur: [
    {
      id: 'jpr-hawa-mahal',
      name: 'Hawa Mahal (Palace of Winds)',
      relativeName: 'Hawa Mahal, Badi Choupad',
      category: 'Palace Heritage',
      emoji: '🏰',
      lat: 26.9239,
      lng: 75.8267,
      address: 'Hawa Mahal Rd, Badi Choupad, J.D.A. Market, Pink City, Jaipur 302002',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800'
    },
    {
      id: 'jpr-amer-fort',
      name: 'Amer Fort (Amber Palace)',
      relativeName: 'Amer Fort, Devisinghpura',
      category: 'Hilltop Fort',
      emoji: '🏰',
      lat: 26.9855,
      lng: 75.8513,
      address: 'Devisinghpura, Amer, Jaipur 302001',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'
    },
    {
      id: 'jpr-station',
      name: 'Jaipur Junction Railway Station',
      relativeName: 'Jaipur Junction, Station Rd',
      category: 'Railway Hub',
      emoji: '🚂',
      lat: 26.9196,
      lng: 75.7878,
      address: 'Gopalbari, Jaipur 302006',
      rating: 4.4,
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800'
    }
  ]
};

/**
 * Gets popular destinations relative to the user's detected live location / city.
 * Automatically computes distance (km) using Haversine formula from origin coords.
 */
export function getPopularDestinationsForCity(cityName, userCoords = null) {
  let targetCity = "Visakhapatnam";
  if (cityName && typeof cityName === 'string') {
    const clean = cityName.trim().toLowerCase();
    if (clean.includes("hyderabad") || clean.includes("secunderabad") || clean.includes("cyberabad")) targetCity = "Hyderabad";
    else if (clean.includes("bengaluru") || clean.includes("bangalore")) targetCity = "Bengaluru";
    else if (clean.includes("delhi") || clean.includes("ncr") || clean.includes("noida") || clean.includes("gurugram")) targetCity = "Delhi";
    else if (clean.includes("mumbai") || clean.includes("bombay") || clean.includes("thane")) targetCity = "Mumbai";
    else if (clean.includes("vijayawada") || clean.includes("amaravati")) targetCity = "Vijayawada";
    else if (clean.includes("jaipur")) targetCity = "Jaipur";
    else if (clean.includes("visakhapatnam") || clean.includes("vizag") || clean.includes("waltair")) targetCity = "Visakhapatnam";
    else {
      // Check if exact key exists
      const match = Object.keys(CITY_DESTINATIONS).find(k => k.toLowerCase() === clean);
      if (match) targetCity = match;
    }
  }

  const list = CITY_DESTINATIONS[targetCity] || CITY_DESTINATIONS["Visakhapatnam"];

  return list.map(item => {
    let distanceKm = null;
    if (userCoords && userCoords.lat && userCoords.lng) {
      distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng, item.lat, item.lng);
    }
    return {
      ...item,
      city: targetCity,
      distanceKm
    };
  });
}

/**
 * Searches across all destinations (both current city and other Indian landmarks)
 * matching a text query, with priority given to the live city.
 */
export function searchLocalDestinations(query, cityName, userCoords = null) {
  if (!query || query.trim().length < 1) return [];
  const q = query.trim().toLowerCase();

  const cityList = getPopularDestinationsForCity(cityName, userCoords);
  const allDestinations = [];

  // 1. Current city items first
  cityList.forEach(item => {
    if (
      item.name.toLowerCase().includes(q) ||
      item.relativeName.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.address.toLowerCase().includes(q)
    ) {
      allDestinations.push({ ...item, isCurrentCity: true });
    }
  });

  // 2. Search other cities
  Object.keys(CITY_DESTINATIONS).forEach(city => {
    if (city.toLowerCase() === (cityName || '').toLowerCase()) return;
    CITY_DESTINATIONS[city].forEach(item => {
      if (
        item.name.toLowerCase().includes(q) ||
        item.relativeName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      ) {
        let distanceKm = null;
        if (userCoords && userCoords.lat && userCoords.lng) {
          distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng, item.lat, item.lng);
        }
        allDestinations.push({ ...item, city, distanceKm, isCurrentCity: false });
      }
    });
  });

  return allDestinations;
}
