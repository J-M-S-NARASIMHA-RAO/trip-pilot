-- ==========================================================
-- ✈️ TRIP PILOT — SUPABASE POSTGRESQL SCHEMA & SEED DATA
-- Run this in Supabase Dashboard -> SQL Editor -> New query
-- ==========================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.locations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    city VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'LANDMARK',
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fare_data (
    id BIGSERIAL PRIMARY KEY,
    transportation_type VARCHAR(50) NOT NULL, -- AUTO, BUS, CAB, SHARED_CAB
    city VARCHAR(100) NOT NULL,
    base_fare DOUBLE PRECISION NOT NULL,
    per_km_rate DOUBLE PRECISION NOT NULL,
    minimum_fare DOUBLE PRECISION NOT NULL,
    waiting_rate_per_min DOUBLE PRECISION DEFAULT 1.0,
    night_surge_multiplier DOUBLE PRECISION DEFAULT 1.0,
    effective_date VARCHAR(50) DEFAULT '2026-01-01',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tourist_places (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    description TEXT,
    history TEXT,
    entry_fee DOUBLE PRECISION DEFAULT 0.0,
    estimated_visit_time_min INT DEFAULT 60,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    category VARCHAR(50),
    image_url TEXT,
    famous_for TEXT,
    best_time VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.restaurants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    cuisine VARCHAR(100),
    price_category VARCHAR(50) DEFAULT 'BUDGET_FRIENDLY', -- BUDGET_FRIENDLY, MODERATE, PREMIUM
    approx_cost_for_two INT DEFAULT 150,
    rating DOUBLE PRECISION DEFAULT 4.5,
    review_count INT DEFAULT 1000,
    local_talk TEXT,
    famous_dishes TEXT,
    distance_meters INT DEFAULT 500,
    address TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fare_reports (
    id BIGSERIAL PRIMARY KEY,
    source VARCHAR(255),
    destination VARCHAR(255),
    transportation_type VARCHAR(50),
    quoted_price DOUBLE PRECISION,
    estimated_min_price DOUBLE PRECISION,
    estimated_max_price DOUBLE PRECISION,
    deviation_percentage DOUBLE PRECISION,
    risk_level VARCHAR(50), -- LOW, MODERATE, HIGH
    confidence_level VARCHAR(50) DEFAULT 'VERIFIED',
    confidence_score DOUBLE PRECISION DEFAULT 87.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trips (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    source VARCHAR(255),
    destination VARCHAR(255),
    stops JSONB DEFAULT '[]'::jsonb,
    travelers INT DEFAULT 1,
    budget DOUBLE PRECISION,
    selected_option VARCHAR(50),
    total_cost DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'PLANNED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) & Public Access Policies
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fare_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fare_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert locations" ON public.locations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read fare_data" ON public.fare_data FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read tourist_places" ON public.tourist_places FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read restaurants" ON public.restaurants FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read fare_reports" ON public.fare_reports FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert fare_reports" ON public.fare_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert trips" ON public.trips FOR INSERT WITH CHECK (true);

-- 3. Pre-Seed Locations
INSERT INTO public.locations (name, latitude, longitude, city, category, address) VALUES
('Visakhapatnam Railway Station', 17.7214, 83.2929, 'Visakhapatnam', 'RAILWAY_STATION', 'Station Rd, Railway Quarters, Visakhapatnam, AP 530004'),
('Vizag Complex', 17.7295, 83.3088, 'Visakhapatnam', 'BUS_STAND', 'Dwaraka Bus Station (RTC Complex), Asilmetta, Visakhapatnam, AP 530016'),
('Ramakrishna (RK) Beach', 17.7142, 83.3235, 'Visakhapatnam', 'TOURIST_SPOT', 'Beach Road, Pandurangapuram, Visakhapatnam, AP 530002'),
('INS Kursura Submarine Museum', 17.7169, 83.3323, 'Visakhapatnam', 'TOURIST_SPOT', 'RK Beach Road, Kirlampudi Layout, Visakhapatnam, AP 530017'),
('Kailasagiri Hilltop Park', 17.7492, 83.3421, 'Visakhapatnam', 'TOURIST_SPOT', 'Hill Top Rd, Kailasagiri, Visakhapatnam, AP 530043'),
('Rushikonda Beach', 17.7819, 83.3855, 'Visakhapatnam', 'TOURIST_SPOT', 'Rushikonda, Bheemili Road, Visakhapatnam, AP 530045'),
('Simhachalam Temple', 17.7665, 83.2505, 'Visakhapatnam', 'HERITAGE', 'Simhachalam, Visakhapatnam, AP 530028'),
('GITAM University', 17.7816, 83.3779, 'Visakhapatnam', 'ACADEMIC', 'Gandhi Nagar, Rushikonda, Visakhapatnam, AP 530045'),
('Srikakulam Railway Station', 18.2954, 83.8967, 'Srikakulam', 'RAILWAY_STATION', 'Amadalavalasa, Srikakulam, AP 532185'),
('Arasavalli Sun Temple', 18.2982, 83.9056, 'Srikakulam', 'HERITAGE', 'Arasavalli, Srikakulam, AP 532001')
ON CONFLICT DO NOTHING;

-- 4. Pre-Seed Regulated Tariffs
INSERT INTO public.fare_data (transportation_type, city, base_fare, per_km_rate, minimum_fare, waiting_rate_per_min, night_surge_multiplier, effective_date) VALUES
('AUTO', 'Visakhapatnam', 20.0, 12.0, 20.0, 1.0, 1.0, '2026-01-01'),
('BUS', 'Visakhapatnam', 10.0, 2.5, 10.0, 0.0, 1.0, '2026-01-01'),
('CAB', 'Visakhapatnam', 60.0, 16.0, 80.0, 2.0, 1.0, '2026-01-01'),
('SHARED_CAB', 'Visakhapatnam', 15.0, 6.0, 20.0, 0.0, 1.0, '2026-01-01'),
('AUTO', 'Srikakulam', 20.0, 10.0, 20.0, 1.0, 1.0, '2026-01-01'),
('BUS', 'Srikakulam', 10.0, 2.0, 10.0, 0.0, 1.0, '2026-01-01'),
('AUTO', 'Vijayawada', 25.0, 13.0, 25.0, 1.0, 1.0, '2026-01-01'),
('AUTO', 'Hyderabad', 30.0, 15.0, 30.0, 1.5, 1.0, '2026-01-01'),
('AUTO', 'Bengaluru', 30.0, 15.0, 30.0, 1.5, 1.0, '2026-01-01')
ON CONFLICT DO NOTHING;

-- 5. Pre-Seed Tourist Attractions
INSERT INTO public.tourist_places (name, city, description, history, entry_fee, estimated_visit_time_min, latitude, longitude, category, image_url, famous_for, best_time) VALUES
('INS Kursura Submarine Museum', 'Visakhapatnam', 'India''s iconic Soviet-built submarine converted into a walkthrough maritime museum on the golden sands of RK Beach.', 'Decommissioned in 2001 after 31 years of illustrious naval service including the 1971 Indo-Pak war.', 70.0, 60, 17.7169, 83.3323, 'MUSEUM', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800', 'Historic Submarine Interior, Torpedo room, Radar deck', '02:00 PM – 08:30 PM (Closed Mondays)'),
('Kailasagiri Hilltop Park', 'Visakhapatnam', 'A 360-degree picturesque hill station overlooking the Bay of Bengal with massive 40-ft Lord Shiva and Parvati statues and ropeway ride.', 'Developed by VUDA as a serene scenic promenade offering a panoramic birds-eye view of Vizag city coastline.', 20.0, 90, 17.7492, 83.3421, 'NATURE', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', 'Ropeway cable car, Toy train ride, Titanic viewpoint', '06:00 AM – 08:00 PM Daily'),
('Ramakrishna (RK) Beach & War Memorial', 'Visakhapatnam', 'The beating heart of Vizag beachfront with scenic promenade, Victory at Sea memorial, and bustling local Andhra street food stalls.', 'Famous for the Victory at Sea memorial commemorating the Eastern Naval Command''s naval victory in 1971.', 0.0, 75, 17.7142, 83.3235, 'BEACH', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800', 'Seaside sunrise, Muri mixture snack, Breezy walkways', 'All day (Best in Morning & Evening)'),
('TU-142 Aircraft Museum', 'Visakhapatnam', 'Decommissioned maritime patrol Tupolev Tu-142 anti-submarine warfare aircraft museum located right opposite Kursura.', 'Served the Indian Navy for 29 years with over 30,000 accident-free flight hours.', 50.0, 45, 17.7162, 83.3315, 'MUSEUM', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 'Flight simulator, Survival equipment, Cockpit tour', '02:00 PM – 08:30 PM'),
('Rushikonda Beach', 'Visakhapatnam', 'Award-winning Blue Flag eco-certified golden beach popular for water sports, surfing, and speed-boating.', 'Surrounded by emerald green Eastern Ghats hills dipping into the azure Bay of Bengal waters.', 0.0, 120, 17.7819, 83.3855, 'BEACH', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', 'Blue Flag Certified clean beach, Sea kayaking, Speedboats', '06:00 AM – 06:30 PM'),
('Simhachalam Sri Varaha Lakshmi Narasimha Temple', 'Visakhapatnam', '11th-century hilltop temple dedicated to Lord Narasimha avatar adorned with sandalwood paste (Chandanotsavam).', 'Architectural marvel blending Kalinga, Chalukya, and Chola stone carvings constructed in 1267 AD.', 0.0, 120, 17.7665, 83.2505, 'HERITAGE', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800', 'Hilltop divine architecture, Sacred steps, Prasadam', '07:00 AM – 09:00 PM')
ON CONFLICT DO NOTHING;

-- 6. Pre-Seed Authentic Vizag Restaurants with Prices, Ratings, and Local Talks
INSERT INTO public.restaurants (name, city, area, cuisine, price_category, approx_cost_for_two, rating, review_count, local_talk, famous_dishes, distance_meters, address, image_url) VALUES
('Sri Sairam Parlour', 'Visakhapatnam', 'Diamond Park / Dwaraka Nagar', 'South Indian Tiffins & Pure Veg', 'BUDGET_FRIENDLY', 140, 4.8, 4200, 'Legendary 30-year-old staple. Unbeatable Ghee Karam Dosa, Sambar Vada & hot degree filter coffee.', 'Ghee Karam Dosa, MLA Pesarattu, Filter Coffee', 850, 'Near Diamond Park, Dwaraka Nagar, Visakhapatnam', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800'),
('Sea Inn (Raju Gari Dhaba)', 'Visakhapatnam', 'Rushikonda / Beach Road', 'Authentic Coastal Andhra Seafood', 'MODERATE', 280, 4.7, 3850, 'Iconic coastal food hideout loved by locals. Must-try spicy Royyala Vepudu (Prawns) and fresh Vanjaram fish fry.', 'Vanjaram Fish Fry, Royyala Biryani, Crab Curry', 12000, 'Beach Road, Near Rushikonda, Visakhapatnam', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800'),
('Venkatadri Vantillu', 'Visakhapatnam', 'Asilmetta / Complex Road', 'Heritage Andhra Breakfast', 'BUDGET_FRIENDLY', 120, 4.6, 2900, 'Home of the world-famous melting Sponge Dosa with spicy red ginger and coconut chutneys. Cheap and super fast.', 'Sponge Dosa, Ghee Idli, Poori Bhaji', 1400, 'Opposite RTC Complex, Asilmetta, Visakhapatnam', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800'),
('Subbayya Gari Hotel', 'Visakhapatnam', 'Dwaraka Nagar 2nd Lane', 'Traditional Andhra Butta Bhojanam', 'BUDGET_FRIENDLY', 180, 4.5, 5100, 'Famous East Godavari Butta Bhojanam served with generous dollops of pure cow ghee, gunpowder podi & majjiga pulusu.', 'Unlimited Butta Bhojanam, Podi Ghee, Sweet Panasa Pandu', 1100, '2nd Lane, Dwaraka Nagar, Visakhapatnam', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800'),
('Jagadamba Street Food Lane', 'Visakhapatnam', 'Jagadamba Junction', 'Vizag Local Street Food & Chaats', 'BUDGET_FRIENDLY', 80, 4.4, 1800, 'Student & tourist evening hotspot for authentic Vizag Tomato Bajji, Muri Mixture, and spicy egg bondas.', 'Tomato Bajji with puffed rice, Muri Mixture, Sweet Corn', 1800, 'Jagadamba Theater Circle, Visakhapatnam', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800'),
('Muntaj Biryani / Alpha Hotel', 'Visakhapatnam', 'Railway Station Main Gate', 'Biryani & Mughlai', 'BUDGET_FRIENDLY', 190, 4.3, 3100, 'Generous portions of aromatic Andhra Dum Biryani right outside the railway station platform exit.', 'Chicken Dum Biryani, Shahi Tukda, Chicken 65', 150, 'Opposite Railway Station Exit, Visakhapatnam', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800'),
('Kamat Restaurant', 'Visakhapatnam', 'Station Road / Surya Bagh', 'North & South Indian Meals', 'MODERATE', 300, 4.1, 1450, 'Clean, comfortable family dining with reliable thalis, rotis, and south meals close to the transit hubs.', 'Special Kamat Veg Thali, Paneer Butter Masala', 900, 'Station Road, Surya Bagh, Visakhapatnam', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Daspalla Executive Court (Dakshin)', 'Visakhapatnam', 'Waltair Main Road', 'Traditional Coastal Andhra Fine Dining', 'PREMIUM', 450, 4.0, 1200, 'Old-school Vizag hospitality, reliable buffet lunch with authentic Gongura Mamsam and seafood delicacies.', 'Gongura Mamsam, Natu Kodi Pulao, Filter Coffee', 2500, 'Waltair Main Road, Ram Nagar, Visakhapatnam', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800')
ON CONFLICT DO NOTHING;