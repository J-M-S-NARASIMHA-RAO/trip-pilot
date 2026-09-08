package com.trippilot.config;

import com.trippilot.model.*;
import com.trippilot.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final LocationRepository locationRepository;
    private final FareDataRepository fareDataRepository;
    private final TouristPlaceRepository touristPlaceRepository;
    private final RouteRepository routeRepository;
    private final TransportationRepository transportationRepository;
    private final RestaurantRepository restaurantRepository;
    private final TariffRuleRepository tariffRuleRepository;
    private final AccommodationRepository accommodationRepository;
    private final RegionalFoodRepository regionalFoodRepository;
    private final TransitHubRepository transitHubRepository;

    public DataInitializer(LocationRepository locationRepository,
                           FareDataRepository fareDataRepository,
                           TouristPlaceRepository touristPlaceRepository,
                           RouteRepository routeRepository,
                           TransportationRepository transportationRepository,
                           RestaurantRepository restaurantRepository,
                           TariffRuleRepository tariffRuleRepository,
                           AccommodationRepository accommodationRepository,
                           RegionalFoodRepository regionalFoodRepository,
                           TransitHubRepository transitHubRepository) {
        this.locationRepository = locationRepository;
        this.fareDataRepository = fareDataRepository;
        this.touristPlaceRepository = touristPlaceRepository;
        this.routeRepository = routeRepository;
        this.transportationRepository = transportationRepository;
        this.restaurantRepository = restaurantRepository;
        this.tariffRuleRepository = tariffRuleRepository;
        this.accommodationRepository = accommodationRepository;
        this.regionalFoodRepository = regionalFoodRepository;
        this.transitHubRepository = transitHubRepository;
    }

    @Override
    public void run(String... args) {
        // Seed Locations
        if (locationRepository.count() == 0) {
            locationRepository.saveAll(List.of(
                new Location("Visakhapatnam Railway Station", 17.7214, 83.2929, "Visakhapatnam", "RAILWAY_STATION", "Station Rd, Railway Quarters, Visakhapatnam, AP 530004"),
                new Location("Vizag Complex", 17.7295, 83.3088, "Visakhapatnam", "BUS_STAND", "Dwaraka Bus Station (RTC Complex), Asilmetta, Visakhapatnam, AP 530016"),
                new Location("Ramakrishna (RK) Beach", 17.7142, 83.3235, "Visakhapatnam", "TOURIST_SPOT", "Beach Road, Pandurangapuram, Visakhapatnam, AP 530002"),
                new Location("INS Kursura Submarine Museum", 17.7169, 83.3323, "Visakhapatnam", "TOURIST_SPOT", "RK Beach Road, Kirlampudi Layout, Visakhapatnam, AP 530017"),
                new Location("Kailasagiri Hilltop Park", 17.7492, 83.3421, "Visakhapatnam", "TOURIST_SPOT", "Hill Top Rd, Kailasagiri, Visakhapatnam, AP 530043"),
                new Location("Rushikonda Beach", 17.7819, 83.3855, "Visakhapatnam", "TOURIST_SPOT", "Rushikonda, Bheemili Road, Visakhapatnam, AP 530045"),
                new Location("Simhachalam Temple", 17.7665, 83.2505, "Visakhapatnam", "HERITAGE", "Simhachalam, Visakhapatnam, AP 530028"),
                new Location("GITAM University", 17.7816, 83.3779, "Visakhapatnam", "ACADEMIC", "Gandhi Nagar, Rushikonda, Visakhapatnam, AP 530045"),
                new Location("Srikakulam Railway Station", 18.2954, 83.8967, "Srikakulam", "RAILWAY_STATION", "Amadalavalasa, Srikakulam, AP 532185"),
                new Location("Arasavalli Sun Temple", 18.2982, 83.9056, "Srikakulam", "HERITAGE", "Arasavalli, Srikakulam, AP 532001"),
                new Location("Vijayawada Railway Station", 16.5178, 80.6200, "Vijayawada", "RAILWAY_STATION", "Station Road, Hanumanpet, Vijayawada, AP 520003"),
                new Location("Hyderabad Deccan Railway Station", 17.3916, 78.4735, "Hyderabad", "RAILWAY_STATION", "Nampally, Hyderabad, Telangana 500001"),
                new Location("Majestic KSR Bengaluru Station", 12.9781, 77.5696, "Bengaluru", "RAILWAY_STATION", "Kempegowda, Sevashrama, Bengaluru, Karnataka 560023")
            ));
        }

        // Seed Regulated Fare Tariffs
        if (fareDataRepository.count() == 0) {
            fareDataRepository.saveAll(List.of(
                new FareData("AUTO", "Visakhapatnam", 20.0, 12.0, 20.0, 1.0, 1.0, "2026-01-01"),
                new FareData("BUS", "Visakhapatnam", 10.0, 2.5, 10.0, 0.0, 1.0, "2026-01-01"),
                new FareData("CAB", "Visakhapatnam", 60.0, 16.0, 80.0, 2.0, 1.0, "2026-01-01"),
                new FareData("SHARED_CAB", "Visakhapatnam", 15.0, 6.0, 20.0, 0.0, 1.0, "2026-01-01"),

                new FareData("AUTO", "Srikakulam", 20.0, 10.0, 20.0, 1.0, 1.0, "2026-01-01"),
                new FareData("BUS", "Srikakulam", 10.0, 2.0, 10.0, 0.0, 1.0, "2026-01-01"),

                new FareData("AUTO", "Vijayawada", 25.0, 13.0, 25.0, 1.0, 1.0, "2026-01-01"),
                new FareData("AUTO", "Hyderabad", 30.0, 15.0, 30.0, 1.5, 1.0, "2026-01-01"),
                new FareData("AUTO", "Bengaluru", 30.0, 15.0, 30.0, 1.5, 1.0, "2026-01-01")
            ));
        }

        // Seed Tourist Attractions
        if (touristPlaceRepository.count() == 0) {
            touristPlaceRepository.saveAll(List.of(
                new TouristPlace(
                    "INS Kursura Submarine Museum", "Visakhapatnam",
                    "India's iconic Soviet-built submarine converted into a walkthrough maritime museum on the golden sands of RK Beach.",
                    "Decommissioned in 2001 after 31 years of illustrious naval service including the 1971 Indo-Pak war.",
                    70.0, 60, 17.7169, 83.3323, "MUSEUM",
                    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
                    "Historic Submarine Interior, Torpedo room, Radar deck",
                    "02:00 PM – 08:30 PM (Closed Mondays)"
                ),
                new TouristPlace(
                    "Kailasagiri Hilltop Park", "Visakhapatnam",
                    "A 360-degree picturesque hill station overlooking the Bay of Bengal with massive 40-ft Lord Shiva and Parvati statues and ropeway ride.",
                    "Developed by VUDA as a serene scenic promenade offering a panoramic birds-eye view of Vizag city coastline.",
                    20.0, 90, 17.7492, 83.3421, "NATURE",
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
                    "Ropeway cable car, Toy train ride, Titanic viewpoint",
                    "06:00 AM – 08:00 PM Daily"
                ),
                new TouristPlace(
                    "Ramakrishna (RK) Beach & War Memorial", "Visakhapatnam",
                    "The beating heart of Vizag beachfront with scenic promenade, Victory at Sea memorial, and bustling local Andhra street food stalls.",
                    "Famous for the Victory at Sea memorial commemorating the Eastern Naval Command's naval victory in 1971.",
                    0.0, 75, 17.7142, 83.3235, "BEACH",
                    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
                    "Seaside sunrise, Muri mixture snack, Breezy walkways",
                    "All day (Best in Morning & Evening)"
                ),
                new TouristPlace(
                    "TU-142 Aircraft Museum", "Visakhapatnam",
                    "Decommissioned maritime patrol Tupolev Tu-142 anti-submarine warfare aircraft museum located right opposite Kursura.",
                    "Served the Indian Navy for 29 years with over 30,000 accident-free flight hours.",
                    50.0, 45, 17.7162, 83.3315, "MUSEUM",
                    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
                    "Flight simulator, Survival equipment, Cockpit tour",
                    "02:00 PM – 08:30 PM"
                ),
                new TouristPlace(
                    "Rushikonda Beach", "Visakhapatnam",
                    "Award-winning Blue Flag eco-certified golden beach popular for water sports, surfing, and speed-boating.",
                    "Surrounded by emerald green Eastern Ghats hills dipping into the azure Bay of Bengal waters.",
                    0.0, 120, 17.7819, 83.3855, "BEACH",
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
                    "Blue Flag Certified clean beach, Sea kayaking, Speedboats",
                    "06:00 AM – 06:30 PM"
                ),
                new TouristPlace(
                    "Simhachalam Sri Varaha Lakshmi Narasimha Temple", "Visakhapatnam",
                    "11th-century hilltop temple dedicated to Lord Narasimha avatar adorned with sandalwood paste (Chandanotsavam).",
                    "Architectural marvel blending Kalinga, Chalukya, and Chola stone carvings constructed in 1267 AD.",
                    0.0, 120, 17.7665, 83.2505, "HERITAGE",
                    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
                    "Hilltop divine architecture, Sacred steps, Prasadam",
                    "07:00 AM – 09:00 PM"
                ),
                new TouristPlace(
                    "Arasavalli Sun Temple", "Srikakulam",
                    "Ancient 7th-century Sun God temple where sun rays touch the feet of Lord Suryanarayana Swami twice a year.",
                    "Built by King Devendra Varma of the Eastern Ganga Dynasty in Srikakulam.",
                    0.0, 60, 18.2982, 83.9056, "HERITAGE",
                    "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
                    "Ratha Saptami, Rare Sun God sanctum, Temple Pushkarini",
                    "06:00 AM – 08:00 PM"
                ),
                new TouristPlace(
                    "Charminar & Laad Bazaar", "Hyderabad",
                    "Magnificent 16th-century four-minaret monument surrounded by traditional bangle markets and Irani chai cafes.",
                    "Built in 1591 by Muhammad Quli Qutb Shah to commemorate the end of a deadly plague.",
                    25.0, 60, 17.3616, 78.4747, "HERITAGE",
                    "https://images.unsplash.com/photo-1572435555646-7ad1f1489679?w=800",
                    "Iconic Arches, Nimrah Irani Chai, Lacquer Bangles",
                    "09:30 AM – 05:30 PM"
                ),
                new TouristPlace(
                    "Golconda Fort", "Hyderabad",
                    "Historic citadel featuring acoustic engineering, ancient vaults, and panoramic sunset views over the Deccan plateau.",
                    "Capital of the medieval Golconda Sultanate and historic marketplace of the Koh-i-Noor diamond.",
                    30.0, 120, 17.3833, 78.4011, "HERITAGE",
                    "https://images.unsplash.com/photo-1606210177726-25e24345d398?w=800",
                    "Clapping Portico Acoustics, Fateh Darwaza, Light & Sound Show",
                    "09:00 AM – 05:30 PM"
                ),
                new TouristPlace(
                    "Lalbagh Botanical Garden", "Bengaluru",
                    "240-acre botanical paradise housing centuries-old trees, a lake, and a stunning 19th-century Victorian Glass House.",
                    "Commissioned by Hyder Ali in 1760 and completed by his son Tipu Sultan.",
                    30.0, 90, 12.9507, 77.5848, "NATURE",
                    "https://images.unsplash.com/photo-1588674937213-9111c1d42858?w=800",
                    "Glass House flower shows, Bonsai garden, Kempegowda Tower",
                    "06:00 AM – 07:00 PM"
                ),
                new TouristPlace(
                    "Bengaluru Palace", "Bengaluru",
                    "Tudor-style royal estate adorned with fortified towers, stained glass windows, and lush gardens.",
                    "Built by Rev. J. Garrett in 1878 and purchased by Maharaja Chamarajendra Wadiyar X.",
                    250.0, 90, 12.9988, 77.5921, "HERITAGE",
                    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800",
                    "Durbar Hall, Victorian Architecture, Royal Memorabilia",
                    "10:00 AM – 05:30 PM"
                ),
                new TouristPlace(
                    "Kanaka Durga Temple", "Vijayawada",
                    "Sacred shrine atop Indrakeeladri hill on the banks of Krishna River, dedicated to Goddess Durga.",
                    "One of Andhra Pradesh's most revered pilgrimage destinations with scenic ghats.",
                    0.0, 90, 16.5186, 80.6095, "HERITAGE",
                    "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
                    "Indrakeeladri Ghat, Prakasam Barrage views, Golden Gopuram",
                    "05:00 AM – 09:00 PM"
                )
            ));
        }

        // Seed Authentic Vizag Restaurants with Prices, Ratings, and Local Talks
        if (restaurantRepository.count() == 0) {
            restaurantRepository.saveAll(List.of(
                new Restaurant(
                    "Sri Sairam Parlour", "Visakhapatnam", "Diamond Park / Dwaraka Nagar",
                    "South Indian Tiffins & Pure Veg", "BUDGET_FRIENDLY", 140, 4.8, 4200,
                    "Legendary 30-year-old staple. Unbeatable Ghee Karam Dosa, Sambar Vada & hot degree filter coffee.",
                    "Ghee Karam Dosa, MLA Pesarattu, Filter Coffee", 850,
                    "Near Diamond Park, Dwaraka Nagar, Visakhapatnam",
                    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800"
                ),
                new Restaurant(
                    "Sea Inn (Raju Gari Dhaba)", "Visakhapatnam", "Rushikonda / Beach Road",
                    "Authentic Coastal Andhra Seafood", "MODERATE", 280, 4.7, 3850,
                    "Iconic coastal food hideout loved by locals. Must-try spicy Royyala Vepudu (Prawns) and fresh Vanjaram fish fry.",
                    "Vanjaram Fish Fry, Royyala Biryani, Crab Curry", 12000,
                    "Beach Road, Near Rushikonda, Visakhapatnam",
                    "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800"
                ),
                new Restaurant(
                    "Venkatadri Vantillu", "Visakhapatnam", "Asilmetta / Complex Road",
                    "Heritage Andhra Breakfast", "BUDGET_FRIENDLY", 120, 4.6, 2900,
                    "Home of the world-famous melting Sponge Dosa with spicy red ginger and coconut chutneys. Cheap and super fast.",
                    "Sponge Dosa, Ghee Idli, Poori Bhaji", 1400,
                    "Opposite RTC Complex, Asilmetta, Visakhapatnam",
                    "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800"
                ),
                new Restaurant(
                    "Subbayya Gari Hotel", "Visakhapatnam", "Dwaraka Nagar 2nd Lane",
                    "Traditional Andhra Butta Bhojanam", "BUDGET_FRIENDLY", 180, 4.5, 5100,
                    "Famous East Godavari Butta Bhojanam served with generous dollops of pure cow ghee, gunpowder podi & majjiga pulusu.",
                    "Unlimited Butta Bhojanam, Podi Ghee, Sweet Panasa Pandu", 1100,
                    "2nd Lane, Dwaraka Nagar, Visakhapatnam",
                    "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800"
                ),
                new Restaurant(
                    "Jagadamba Street Food Lane", "Visakhapatnam", "Jagadamba Junction",
                    "Vizag Local Street Food & Chaats", "BUDGET_FRIENDLY", 80, 4.4, 1800,
                    "Student & tourist evening hotspot for authentic Vizag Tomato Bajji, Muri Mixture, and spicy egg bondas.",
                    "Tomato Bajji with puffed rice, Muri Mixture, Sweet Corn", 1800,
                    "Jagadamba Theater Circle, Visakhapatnam",
                    "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800"
                ),
                new Restaurant(
                    "Muntaj Biryani / Alpha Hotel", "Visakhapatnam", "Railway Station Main Gate",
                    "Biryani & Mughlai", "BUDGET_FRIENDLY", 190, 4.3, 3100,
                    "Generous portions of aromatic Andhra Dum Biryani right outside the railway station platform exit.",
                    "Chicken Dum Biryani, Shahi Tukda, Chicken 65", 150,
                    "Opposite Railway Station Exit, Visakhapatnam",
                    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800"
                ),
                new Restaurant(
                    "Kamat Restaurant", "Visakhapatnam", "Station Road / Surya Bagh",
                    "North & South Indian Meals", "MODERATE", 300, 4.1, 1450,
                    "Clean, comfortable family dining with reliable thalis, rotis, and south meals close to the transit hubs.",
                    "Special Kamat Veg Thali, Paneer Butter Masala", 900,
                    "Station Road, Surya Bagh, Visakhapatnam",
                    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800"
                ),
                new Restaurant(
                    "Daspalla Executive Court (Dakshin)", "Visakhapatnam", "Waltair Main Road",
                    "Traditional Coastal Andhra Fine Dining", "PREMIUM", 450, 4.0, 1200,
                    "Old-school Vizag hospitality, reliable buffet lunch with authentic Gongura Mamsam and seafood delicacies.",
                    "Gongura Mamsam, Natu Kodi Pulao, Filter Coffee", 2500,
                    "Waltair Main Road, Ram Nagar, Visakhapatnam",
                    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"
                )
            ));
        }

        // Seed Routes
        if (routeRepository.count() == 0) {
            routeRepository.saveAll(List.of(
                new Route("Visakhapatnam Railway Station", "Vizag Complex", 2.8, 12, "17.7214,83.2929;17.7250,83.3000;17.7295,83.3088"),
                new Route("Visakhapatnam Railway Station", "Ramakrishna (RK) Beach", 5.2, 18, "17.7214,83.2929;17.7180,83.3100;17.7142,83.3235"),
                new Route("Visakhapatnam Railway Station", "Kailasagiri Hilltop Park", 11.5, 28, "17.7214,83.2929;17.7350,83.3200;17.7492,83.3421"),
                new Route("Srikakulam", "Visakhapatnam", 108.0, 135, "18.2954,83.8967;17.7214,83.2929")
            ));
        }

        // Seed 5-City Official Tariff Rules
        if (tariffRuleRepository.count() == 0) {
            tariffRuleRepository.saveAll(List.of(
                new TariffRule("Visakhapatnam", "AUTO", 20.0, 1.5, 12.0, 50.0, 1.0, "AP RTO Gazette No. 42"),
                new TariffRule("Visakhapatnam", "CAB", 60.0, 2.0, 16.0, 25.0, 2.0, "AP Transport Dept 2024"),
                new TariffRule("Hyderabad", "AUTO", 30.0, 1.6, 15.0, 50.0, 1.2, "TS RTO Notification 2023"),
                new TariffRule("Hyderabad", "CAB", 80.0, 2.0, 18.0, 25.0, 2.5, "TS Transport Dept 2024"),
                new TariffRule("Bengaluru", "AUTO", 30.0, 2.0, 15.0, 50.0, 1.0, "KA Transport Gaz. 109"),
                new TariffRule("Bengaluru", "CAB", 100.0, 4.0, 18.0, 20.0, 2.0, "KA City Taxi Rules 2024"),
                new TariffRule("Delhi", "AUTO", 30.0, 1.5, 11.0, 25.0, 1.0, "Delhi Transport Dept 2023"),
                new TariffRule("Delhi", "CAB", 50.0, 1.0, 14.0, 25.0, 1.5, "Delhi Taxi Scheme 2024"),
                new TariffRule("Mumbai", "AUTO", 23.0, 1.5, 15.33, 25.0, 1.2, "MMRTA Order Oct 2022"),
                new TariffRule("Mumbai", "CAB", 28.0, 1.5, 18.66, 25.0, 1.5, "MMRTA Order Oct 2022")
            ));
        }

        // Seed 5-City Transit Hubs
        if (transitHubRepository.count() == 0) {
            transitHubRepository.saveAll(List.of(
                new TransitHub("Visakhapatnam", "Visakhapatnam Railway Station (VSKP)", "RAILWAY_STATION", 17.7214, 83.2929, "Station Rd, Dondaparthy, Visakhapatnam", "APSRTC 28A, 10K, 69"),
                new TransitHub("Visakhapatnam", "Dwaraka RTC Bus Complex (Vizag Complex)", "BUS_TERMINUS", 17.7295, 83.3088, "Asilmetta, Visakhapatnam", "All Intercity & City Routes"),
                new TransitHub("Visakhapatnam", "Visakhapatnam Int'l Airport (VTZ)", "AIRPORT", 17.7211, 83.2245, "NH16, Visakhapatnam", "RTC Airport Express 38"),
                new TransitHub("Hyderabad", "Secunderabad Junction (SC)", "RAILWAY_STATION", 17.4334, 78.5015, "Secunderabad, Telangana", "TSRTC 10H, 49M, Blue Metro Line"),
                new TransitHub("Hyderabad", "Mahatma Gandhi Bus Station (MGBS)", "BUS_TERMINUS", 17.3789, 78.4839, "Gowliguda, Hyderabad", "Hyderabad Metro Interchange"),
                new TransitHub("Hyderabad", "Rajiv Gandhi Int'l Airport (RGIA)", "AIRPORT", 17.2403, 78.4294, "Shamshabad, Hyderabad", "Pushpak Airport Liner"),
                new TransitHub("Bengaluru", "KSR Bengaluru City Station (Majestic)", "RAILWAY_STATION", 12.9781, 77.5696, "Kempegowda, Bengaluru", "Namma Metro Purple & Green, BMTC"),
                new TransitHub("Bengaluru", "Kempegowda Bus Station (Majestic)", "BUS_TERMINUS", 12.9767, 77.5713, "Subhash Nagar, Bengaluru", "BMTC Vayu Vajra Airport Buses"),
                new TransitHub("Bengaluru", "Kempegowda Int'l Airport (BLR)", "AIRPORT", 13.1986, 77.7066, "Devanahalli, Bengaluru", "BMTC KIA Airport Line"),
                new TransitHub("Delhi", "New Delhi Railway Station (NDLS)", "RAILWAY_STATION", 28.6431, 77.2197, "Paharganj, New Delhi", "Delhi Metro Yellow Line & Airport Express"),
                new TransitHub("Delhi", "Kashmere Gate ISBT", "BUS_TERMINUS", 28.6675, 77.2285, "Kashmere Gate, Delhi", "Metro Red, Yellow, Violet Lines"),
                new TransitHub("Delhi", "Indira Gandhi Int'l Airport (DEL)", "AIRPORT", 28.5562, 77.1000, "Palam, New Delhi", "Delhi Metro Orange Line"),
                new TransitHub("Mumbai", "Chhatrapati Shivaji Maharaj Terminus (CSMT)", "RAILWAY_STATION", 18.9401, 72.8354, "Fort, Mumbai", "Central Railway, BEST 138"),
                new TransitHub("Mumbai", "Mumbai Central (MMCT)", "RAILWAY_STATION", 18.9696, 72.8193, "Mumbai Central, Mumbai", "Western Railway"),
                new TransitHub("Mumbai", "Chhatrapati Shivaji Int'l Airport (BOM)", "AIRPORT", 19.0896, 72.8656, "Sahar, Mumbai", "Metro Line 3, Auto/Cab")
            ));
        }

        // Seed 5-City Verified Accommodations & Hostels
        if (accommodationRepository.count() == 0) {
            accommodationRepository.saveAll(List.of(
                new Accommodation("Visakhapatnam", "Zostel Visakhapatnam", "HOSTEL", 599.0, 4.8, 420, "Beach Road, Pandurangapuram, Visakhapatnam", 17.7125, 83.3210, "Free WiFi, AC, Lockers, Cafe", "Ramakrishna Beach", "https://www.zostel.com", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"),
                new Accommodation("Visakhapatnam", "Youth Hostel Lawson's Bay", "DORMITORY", 350.0, 4.3, 195, "Lawson's Bay Colony, Visakhapatnam", 17.7340, 83.3380, "Budget bunk beds, Sea view, Student friendly", "Vizag Complex", "https://www.yhaindia.org", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"),
                new Accommodation("Visakhapatnam", "Hotel Royal Fort Stay", "BUDGET", 799.0, 4.2, 510, "Station Road, Dwaraka Nagar, Visakhapatnam", 17.7240, 83.2980, "Private Room, AC, 24h Hot Water", "Visakhapatnam Railway Station", "https://www.booking.com", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"),
                new Accommodation("Hyderabad", "Shepherd Stories Backpacker Hostel", "HOSTEL", 650.0, 4.7, 340, "Road 12, Banjara Hills, Hyderabad", 17.4156, 78.4350, "Coworking Space, Rooftop Cafe, AC Bunks", "Nampally Station", "https://www.booking.com", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"),
                new Accommodation("Hyderabad", "Balaji Dormitory MGBS", "DORMITORY", 300.0, 4.1, 150, "Opposite Central Bus Station, Gowliguda, Hyderabad", 17.3795, 78.4845, "CCTV, 24/7 Check-in, Luggage Locker", "Mahatma Gandhi Bus Station", "https://www.booking.com", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"),
                new Accommodation("Bengaluru", "Zostel Bangalore Indiranagar", "HOSTEL", 699.0, 4.8, 620, "100ft Road, Indiranagar, Bengaluru", 12.9719, 77.6412, "High Speed WiFi, Game Room, AC Dorms", "Majestic Station", "https://www.zostel.com", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"),
                new Accommodation("Bengaluru", "Majestic Backpacker Dorm", "DORMITORY", 350.0, 4.2, 280, "Subhash Nagar, Near Kempegowda Terminus, Bengaluru", 12.9770, 77.5705, "Student Discounts, Safe Lockers, Hot Water", "Kempegowda Bus Station", "https://www.booking.com", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"),
                new Accommodation("Delhi", "Stops Hostel New Delhi", "HOSTEL", 550.0, 4.6, 510, "Asaf Ali Road, Near Delhi Gate Metro, New Delhi", 28.6410, 77.2370, "Walking Tours, Breakfast, Free WiFi", "New Delhi Railway Station", "https://www.hostelworld.com", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"),
                new Accommodation("Delhi", "Paharganj Tourist Inn", "BUDGET", 450.0, 4.0, 390, "Main Bazaar, Paharganj, New Delhi", 28.6440, 77.2150, "Clean bed, Attach bath, 5 min walk to NDLS", "New Delhi Railway Station", "https://www.booking.com", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"),
                new Accommodation("Mumbai", "Cohostel Bandra West", "HOSTEL", 750.0, 4.7, 430, "Perry Cross Road, Bandra West, Mumbai", 19.0580, 72.8300, "Clean dorms, Cafe, Close to Bandra promenade", "Mumbai Central", "https://www.booking.com", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"),
                new Accommodation("Mumbai", "Dadar Central Retiring Dorm", "DORMITORY", 400.0, 4.2, 310, "Station Road, Dadar East, Mumbai", 19.0180, 72.8430, "Transit Bunks, 24h Guard, Clean Washrooms", "Dadar Central", "https://www.irctctourism.com", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800")
            ));
        }

        // Seed 5-City Authentic Regional Food Radar (< ₹150 Budget Friendly)
        if (regionalFoodRepository.count() == 0) {
            regionalFoodRepository.saveAll(List.of(
                new RegionalFood("Visakhapatnam", "Venkatadri Ghee Sponge Dosa", "South Indian Breakfast", "₹50 - ₹70", 60.0, 4.7, "Asilmetta, Opp RTC Complex", "Venkatadri Vantillu", 17.7295, 83.3088, "Cloud-soft melting dosa with spicy allam pachadi and coconut chutney.", true, "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800"),
                new RegionalFood("Visakhapatnam", "Vizag Tomato Bajji & Muri Mixture", "Beach Street Snack", "₹30 - ₹50", 40.0, 4.5, "RK Beach Promenade & Jagadamba", "Balu Muri Stall", 17.7142, 83.3235, "Spicy fried tomatoes stuffed with puffed rice, roasted peanuts & lemon.", true, "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800"),
                new RegionalFood("Visakhapatnam", "Subbayya Gari Butta Bhojanam", "Traditional Andhra Meals", "₹120 - ₹160", 150.0, 4.6, "Dwaraka Nagar 2nd Lane", "Subbayya Gari Hotel", 17.7280, 83.3050, "Full basket meal with gunpowder podi, hot rice, pure ghee, and sweet panasa pandu.", true, "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800"),
                new RegionalFood("Visakhapatnam", "Fresh Vanjaram Fish Fry", "Coastal Andhra Seafood", "₹120 - ₹150", 140.0, 4.4, "Rushikonda Beach Road", "Sea Inn (Raju Gari Dhaba)", 17.7819, 83.3855, "Marinated in coastal spices and shallow-fried fresh on an open tawa.", true, "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800"),
                new RegionalFood("Hyderabad", "Authentic Hyderabadi Dum Biryani", "Mughlai / Nizami", "₹130 - ₹180", 150.0, 4.8, "RTC X Roads & Nampally", "Bawarchi / Cafe Bahar", 17.4042, 78.4983, "Aromatic basmati rice cooked on slow dum with tender spiced meat and mirchi ka salan.", true, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800"),
                new RegionalFood("Hyderabad", "Irani Chai with Osmania Biscuit", "Irani Cafe Classic", "₹25 - ₹40", 35.0, 4.7, "Opposite Charminar", "Nimrah Cafe & Bakery", 17.3616, 78.4747, "Creamy, rich boiled tea served with sweet-salty melt-in-mouth Osmania biscuits.", true, "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800"),
                new RegionalFood("Hyderabad", "Ram Ki Bandi Butter Dosa", "Midnight Street Food", "₹50 - ₹80", 65.0, 4.6, "Mozamjahi Market, Nampally", "Ram Ki Bandi", 17.3820, 78.4780, "Famous night dosa drenched in Amul butter, cheese, and spicy tomato paste.", true, "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800"),
                new RegionalFood("Bengaluru", "CTR Shri Sagar Benne Masala Dose", "Karavali / Udupi", "₹65 - ₹85", 80.0, 4.9, "Margosa Road, Malleshwaram", "Central Tiffin Room (CTR)", 13.0035, 77.5710, "Golden crispy on the outside, fluffy inside, roasted in generous pure white butter.", true, "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800"),
                new RegionalFood("Bengaluru", "Brahmin's Coffee Bar Idli Vada", "Heritage Tiffin", "₹40 - ₹60", 50.0, 4.8, "Shankarpuram, Basavanagudi", "Brahmin's Coffee Bar", 12.9490, 77.5700, "Melt-in-mouth steaming hot idlis and crispy medu vada served with legendary coconut chutney.", true, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800"),
                new RegionalFood("Delhi", "Paranthe Wali Gali Stuffed Paranthas", "Old Delhi Heritage", "₹60 - ₹90", 80.0, 4.6, "Chandni Chowk, Old Delhi", "Pt. Kanhaiyalal Durgaprasad", 28.6560, 77.2310, "Deep-fried paranthas stuffed with rabri, aloo, or khoya served with pumpkin subzi.", true, "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800"),
                new RegionalFood("Delhi", "Sita Ram Diwan Chand Chole Bhature", "Punjabi Street Food", "₹70 - ₹100", 90.0, 4.7, "Paharganj, Near NDLS", "Sita Ram Diwan Chand", 28.6430, 77.2140, "Fluffy paneer-stuffed bhaturas served with spicy dark Amritsari chole and carrot pickle.", true, "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800"),
                new RegionalFood("Mumbai", "Ashok Vada Pav (Kirti College)", "Mumbai Street Soul", "₹20 - ₹30", 25.0, 4.8, "Cadel Road, Prabhadevi", "Ashok Vada Pav", 19.0190, 72.8290, "Crispy golden batata vada inside pav with secret spicy garlic chutney and crispy chura.", true, "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800"),
                new RegionalFood("Mumbai", "Kyani Bun Maska & Irani Chai", "Parsi Cafe Classic", "₹35 - ₹55", 45.0, 4.7, "Opp Metro Cinema, Marine Lines", "Kyani & Co.", 18.9430, 72.8270, "Fresh baked crusty bun lavishly spread with maska butter, dipped in hot sweet chai.", true, "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800")
            ));
        }
    }
}