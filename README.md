# ✈️ TRIP PILOT — Full-Stack Anti-Deceptive Smart Travel Super-App

> **Tagline:** *"Travel Smart. Pay Fair. Explore More."*  
> **Core Philosophy:** *"You don't know the city. Trip Pilot does."*

---

## 🎯 Application Concept & Ethical Distinction

**Trip Pilot** is an AI-powered smart tourist mobility, anti-deceptive fare calculation, accommodation, regional food, and navigation companion designed for students, tourists, and first-time travelers arriving in unfamiliar Indian cities.

**CRITICAL ETHICAL DISTINCTION:**
Trip Pilot is **NOT** a competitor to Uber, Rapido, IRCTC, or Booking.com, and does **NOT** simulate fake booking checkouts. Instead, it serves as the single unified **discovery, comparison, decision, and navigation layer** that protects travelers from unfair pricing, calculates fair government-aligned fares, optimizes multi-modal transit budgets, and redirects users to official platforms (Uber, Rapido, Ola, APSRTC, IRCTC) with pre-filled destination parameters.

---

## 🌟 7 Core Modules + 5 Strategic Additions

1. **Zero-Setup Multi-City Database Seeding (`data.sql` & `DataInitializer.java`)**
   - Pre-loaded with official statutory tariffs, verified transit hubs, backpacker dorms (< ₹400), and regional food stalls (< ₹150) across **5 major cities**:
     - **Visakhapatnam** (AP RTO meter rates, RTC Complex, Zostel, Venkatadri Dosa)
     - **Hyderabad** (TSRTC rates, Nampally & MGBS, Shepherd Stories, Bawarchi Dum Biryani)
     - **Bengaluru** (KA RTO rates, Majestic Station, Zostel Indiranagar, CTR Benne Dose)
     - **Delhi** (Delhi Transport Dept rates, NDLS, Paharganj Inns, Paranthe Wali Gali)
     - **Mumbai** (MMRTA Kali-Peeli meter rates, CSMT, Bandra Hostels, Ashok Vada Pav)

2. **Multi-Provider Comparison Matrix (`/api/providers/compare`)**
   - Side-by-side comparison for any route:
     - **Government Meter Auto** (Tariff Verified badge, statutory meter rule)
     - **Rapido Bike Taxi** (App Estimate badge, pre-filled deep link)
     - **Rapido Auto / Uber Auto** (App Estimate badge, pre-filled deep link)
     - **Uber Go / AC Cab** (App Estimate badge, pre-filled deep link)
     - **City RTC Bus** (Public Transit badge, stage ticketing)
     - **Walking Route** (Zero Emission badge, calorie burn calculation)

3. **Automated Road Distance & Multi-Modal Speed Profiling (`/api/location/route`)**
   - Empirical urban Indian road winding factor:
     $$d_{road} = d_{haversine} \times 1.32$$
   - Multi-modal travel time estimation across Walk (4.5 km/h), Bike (24 km/h), Auto (28 km/h), Cab (32 km/h), and Bus (18 km/h).

4. **Dual-Mode AI Companion (`/api/ai/companion`)**
   - **Google Gemini 1.5 Flash** online integration with dynamic session contextualization (city, origin, destination, time of day, night surcharge status).
   - **Offline Rule-Based Intelligence Fallback** in **English, Telugu (తెలుగు), and Hindi (हिंदी)** when offline or without API key.

5. **Audio Fare Voice Advisor (Native Web Speech API)**
   - Vocalizes fair fare advice and anti-deception analysis aloud in the user's selected language (Telugu, Hindi, English).

6. **Mobile-First Super-App Cockpit & Bottom Thumb Navigation**
   - Persistent radar map with live GPS tracking (±3m accuracy).
   - Fixed bottom thumb-zone nav: **Home**, **Fare**, **Plan**, **Explore**, **Trip** + **SOS**.
   - Persistent 🚨 **Emergency SOS Hub** with 1-tap call (112, 1091, 100) and instant WhatsApp live location broadcast.

7. **1-Click Hackathon Jury Demonstration Presets**
   - 5 built-in 1-click test scenarios across all 5 cities:
     - *Visakhapatnam:* Railway Station ➔ RTC Complex (Quoted ₹100 vs fair ₹25, +233% High Price Deviation)
     - *Hyderabad:* Secunderabad ➔ Charminar (Quoted ₹250 vs fair ₹110)
     - *Bengaluru:* Majestic ➔ Indiranagar (Quoted ₹300 vs fair ₹130)
     - *Delhi:* NDLS ➔ India Gate (Quoted ₹200 vs fair ₹60)
     - *Mumbai:* CSMT ➔ Marine Drive (Quoted ₹150 vs fair ₹45)

8. **Backpacker Dorms & Regional Food Radar (< ₹150)**
   - Curated student-friendly dormitories and hostels (< ₹400 - ₹700) with links to official booking sites.
   - Regional street food stalls with FSSAI hygiene ratings and Google Maps directions.

---

## 🚀 Quick Start & Running

### Method 1: 1-Click Batch Runner (Windows)
Double-click `run-app.bat` or run:
```powershell
.\run.ps1
```
This automatically starts:
- Spring Boot Backend on `http://localhost:8080`
- React Vite Frontend on `http://localhost:5173` (or `http://localhost:3000`)
- Opens your browser automatically!

### Method 2: Manual Terminal Commands

#### 1. Backend (Spring Boot 3.2.5 + Java 17)
```bash
cd backend
mvn clean package -DskipTests
java -jar target/trip-pilot-backend-1.0.0-SNAPSHOT.jar
```
- API Base: `http://localhost:8080/api`
- H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:trippilotdb`, User: `sa`, Password: empty)

#### 2. Frontend (React 18 + Vite + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
- Open `http://localhost:5173` in your browser.

---

## 📡 REST API Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/fare/check` | Analyzes driver quoted fare, computes statutory range, flags price deviations |
| `GET/POST` | `/api/providers/compare` | Compares statutory meter auto, Rapido, Uber, Ola, Bus, Walk with badges & deep links |
| `GET` | `/api/accommodations` | Returns verified backpacker dorms, hostels, and budget stays by city & price |
| `GET` | `/api/food` | Returns authentic regional foods & budget culinary radar (< ₹150) |
| `GET/POST` | `/api/location/route` | Computes Haversine distance, road distance ($d \times 1.32$), and multi-modal ETAs |
| `GET` | `/api/location/hubs` | Returns major railway, bus, airport, and metro transit hubs for the city |
| `POST` | `/api/ai/companion` | Gemini 1.5 Flash AI travel advisor with offline multilingual fallback (EN/TE/HI) |
| `POST` | `/api/ai/chat` | Chat assistant for itineraries and local tourist tips |

---

## 🏆 SIH Hackathon Jury Testing Guide

1. Open `http://localhost:5173`.
2. Click **"🏆 Jury Presets"** in the top navigation bar or home hero section.
3. Select any of the 5 city presets (e.g., **VSKP Railway Station ➔ Vizag RTC Complex**).
4. Watch Trip Pilot:
   - Calculate the shortest route (2.8 km).
   - Flag the driver's quoted ₹100 as **🔴 High Price Deviation (+233%)**.
   - Show the statutory regulated rate of ₹20–₹30.
   - Click **"🔊 Listen Advice"** to hear the verdict vocalized aloud.
   - View the **Multi-Provider Comparison Matrix** comparing Government Meter vs Rapido vs Uber vs City Bus.
   - Click **"Book on Rapido"** or **"Book on Uber"** to see coordinates and destination pre-filled automatically!
5. Click **"🚨 SOS"** to test 1-tap emergency calling and WhatsApp live GPS broadcast.
6. Switch to the **Explore** tab to browse verified dorms (< ₹400) and regional street food stalls (< ₹150).