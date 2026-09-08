import React, { useState } from 'react';
import { 
  Compass, ShieldCheck, MapPin, Navigation, Bot, 
  Sparkles, DollarSign, Calendar, Layers, PhoneCall, Utensils, 
  Award, Flag, Zap, Home, Route, Search 
} from 'lucide-react';
import Navbar from './components/Navbar';
import CurrentLocationBanner from './components/CurrentLocationBanner';
import FareCheckerWidget from './components/FareCheckerWidget';
import SmartMobilityPlanner from './components/SmartMobilityPlanner';
import LiveMap from './components/LiveMap';
import TripMode from './components/TripMode';
import ExploreWithMe from './components/ExploreWithMe';
import NearbyRestaurants from './components/NearbyRestaurants';
import AIChatModal from './components/AIChatModal';
import HackathonScenariosModal from './components/HackathonScenariosModal';
import EmergencySosModal from './components/EmergencySosModal';
import StayAndFoodExplorer from './components/StayAndFoodExplorer';
import { translations } from './translations';
import { getLocalScamReports } from './services/safetyService';
import { useRealtimeLocation } from './hooks/useRealtimeLocation';

export default function App() {
  const [currentLang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('home');
  const [userMode, setUserMode] = useState('TOURIST'); // 'TOURIST' or 'STUDENT'
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [showScenariosModal, setShowScenariosModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);

  // Live real-time location state (Initialized in detecting mode, then locked by device GPS / IP)
  const [location, setLocation] = useState({
    name: "Acquiring Live GPS...",
    city: "Detecting City...",
    address: "Locking onto your physical device location...",
    lat: null,
    lng: null,
    accuracy: null,
    isGpsDetected: false,
    isLocating: true
  });

  const [exploredCity, setExploredCity] = useState(null);

  // Continuous real-time high-accuracy GPS tracking (~3m precision)
  const { startTracking, errorMsg: gpsError } = useRealtimeLocation((newLoc) => {
    setLocation((prev) => ({
      ...prev,
      ...newLoc,
      isLocating: false
    }));
  });


  const [destinationName, setDestinationName] = useState("");
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [stops, setStops] = useState([]);
  const [scamHotspots, setScamHotspots] = useState(getLocalScamReports());

  const [activeOption, setActiveOption] = useState({
    type: "AUTO",
    title: "Local Auto Rickshaw",
    provider: "Regulated Stand / Rapido",
    totalCost: 30,
    estimatedFareMin: 25,
    estimatedFareMax: 35
  });

  const t = translations[currentLang] || translations.en;

  const handleStartTrip = (option, destination) => {
    setActiveOption(option);
    if (destination) setDestinationName(destination);
    setActiveTab('tripMode');
  };

  const handleSelectRestaurant = (restaurantName) => {
    setDestinationName(restaurantName);
    setActiveTab('plan');
  };

  const handleExploreCity = (city) => {
    if (city && city !== "Detecting City..." && city !== "Current Location") {
      setExploredCity(city);
    }
    setActiveTab('explore');
  };


  const handleSelectScenario = (sc) => {
    setLocation({
      name: sc.source,
      city: sc.city,
      address: `${sc.source}, ${sc.city}`,
      lat: sc.pickupCoords?.lat || 17.7214,
      lng: sc.pickupCoords?.lng || 83.2929,
      accuracy: 3,
      isGpsDetected: true
    });
    setDestinationName(sc.destination);
    setDestinationCoords(sc.dropCoords || null);
    setActiveTab('checkFare');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-28 lg:pb-14">
      
      {/* Top Header Navbar */}
      <Navbar
        currentLang={currentLang}
        setLang={setLang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userMode={userMode}
        setUserMode={setUserMode}
        onOpenScenarios={() => setShowScenariosModal(true)}
        onOpenSos={() => setShowSosModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Persistent Current Location Bar */}
        <CurrentLocationBanner
          currentLang={currentLang}
          location={location}
          setLocation={setLocation}
          onExploreCity={handleExploreCity}
          onRefreshGps={startTracking}
          gpsError={gpsError}
        />

        {/* Tab 1: HOME (Hero + Fare Check + Mobility Planner + Google Map) */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Quick Hero Banner */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  Welcome to {location.city || "Visakhapatnam"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                  “{t.tagline}”
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                  {t.subtitle}
                </p>
              </div>

              {/* Quick shortcut buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowScenariosModal(true)}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs px-3.5 py-2.5 rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  title="Load 5-City Jury Demo Presets"
                >
                  <span>🏆</span> Jury Presets
                </button>
                <button
                  onClick={() => setActiveTab('checkFare')}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-red-500/20 active:scale-95 flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" /> {t.checkAFare}
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-1.5"
                >
                  <Utensils className="h-4 w-4" /> Stays &amp; Food
                </button>
                <button
                  onClick={() => setIsAiOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center gap-1.5"
                >
                  <Bot className="h-4 w-4" /> {t.askTripPilot}
                </button>
              </div>
            </div>

            {/* Fare Checker Widget */}
            <FareCheckerWidget
              currentLang={currentLang}
              originLocation={location}
              destination={destinationName}
              destCoords={destinationCoords}
              stops={stops}
              onStopsChange={setStops}
              onSelectPlan={(opt) => handleStartTrip(opt, destinationName)}
              onDestinationChange={(name, coords) => {
                setDestinationName(name);
                setDestinationCoords(coords || null);
              }}
              onScamReported={(reports) => setScamHotspots(reports)}
            />

            {/* Google Map Live Transit & Route */}
            <LiveMap
              currentLang={currentLang}
              originLocation={location}
              destinationName={destinationName}
              destinationCoords={destinationCoords}
              stops={stops}
              scamHotspots={scamHotspots}
            />

            {/* Smart Mobility Planner */}
            <SmartMobilityPlanner
              currentLang={currentLang}
              originLocation={location}
              userMode={userMode}
              onStartTrip={handleStartTrip}
            />

            {/* Verified Backpacker Stays & Regional Food Radar */}
            <StayAndFoodExplorer currentCity={location.city && location.city !== "Detecting City..." ? location.city : "Visakhapatnam"} />


            {/* Nearby Restaurants Preview */}
            <NearbyRestaurants
              currentLang={currentLang}
              originLocation={location}
              onSelectRestaurant={handleSelectRestaurant}
            />

          </div>
        )}

        {/* Tab 2: CHECK FARE ("Check Before You Pay") */}
        {activeTab === 'checkFare' && (
          <div className="space-y-6">
            <FareCheckerWidget
              currentLang={currentLang}
              originLocation={location}
              destination={destinationName}
              destCoords={destinationCoords}
              stops={stops}
              onStopsChange={setStops}
              onSelectPlan={(opt) => handleStartTrip(opt, destinationName)}
              onDestinationChange={(name, coords) => {
                setDestinationName(name);
                setDestinationCoords(coords || null);
              }}
              onScamReported={(reports) => setScamHotspots(reports)}
            />
            <LiveMap
              currentLang={currentLang}
              originLocation={location}
              destinationName={destinationName}
              destinationCoords={destinationCoords}
              stops={stops}
              scamHotspots={scamHotspots}
            />
          </div>
        )}

        {/* Tab 3: MOBILITY PLANNER */}
        {activeTab === 'plan' && (
          <div className="space-y-6">
            <SmartMobilityPlanner
              currentLang={currentLang}
              originLocation={location}
              userMode={userMode}
              onStartTrip={handleStartTrip}
            />
            <LiveMap
              currentLang={currentLang}
              originLocation={location}
              destinationName={destinationName}
              destinationCoords={destinationCoords}
              stops={stops}
              scamHotspots={scamHotspots}
            />
          </div>
        )}

        {/* Tab 4: LIVE GOOGLE MAP */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <LiveMap
              currentLang={currentLang}
              originLocation={location}
              destinationName={destinationName}
              destinationCoords={destinationCoords}
              stops={stops}
              scamHotspots={scamHotspots}
            />
          </div>
        )}

        {/* Tab 5: TRIP MODE */}
        {activeTab === 'tripMode' && (
          <div className="space-y-6">
            <TripMode
              currentLang={currentLang}
              activeOption={activeOption}
              originLocation={location}
              destinationName={destinationName}
              stops={stops}
              onEndTrip={() => setActiveTab('explore')}
            />
            <LiveMap
              currentLang={currentLang}
              originLocation={location}
              destinationName={destinationName}
              destinationCoords={destinationCoords}
              stops={stops}
              scamHotspots={scamHotspots}
            />
          </div>
        )}

        {/* Tab 6: EXPLORE SIGHTS, STAYS & FOOD */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            <StayAndFoodExplorer currentCity={exploredCity || (location.city && location.city !== "Detecting City..." ? location.city : "Visakhapatnam")} />

            <ExploreWithMe
              currentLang={currentLang}
              originLocation={location}
              initialCity={exploredCity || (location.city && location.city !== "Detecting City..." ? location.city : "Visakhapatnam")}
              onSelectAttraction={(name) => {
                setDestinationName(name);
                setActiveTab('plan');
              }}
            />
          </div>
        )}


        {/* Tab 7: NEARBY RESTAURANTS */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            <NearbyRestaurants
              currentLang={currentLang}
              originLocation={location}
              onSelectRestaurant={handleSelectRestaurant}
            />
          </div>
        )}

        {/* Tab 8: AI COMPANION */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <Bot className="h-12 w-12 text-teal-600 mx-auto mb-3 animate-bounce" />
              <h2 className="text-xl font-black text-slate-900">Trip Pilot AI Travel Companion</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Ask about fare negotiations in Telugu, Hindi, or English, get budget itineraries, or learn about tourist spots.
              </p>
              <button
                onClick={() => setIsAiOpen(true)}
                className="mt-4 bg-teal-600 text-white font-bold text-xs px-6 py-2.5 rounded-2xl shadow-md hover:bg-teal-700"
              >
                Open Conversational Chat
              </button>
            </div>
          </div>
        )}

      </main>

      {/* FIXED BOTTOM THUMB-ZONE NAVIGATION (MOBILE-FIRST SUPER-APP COCKPIT) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'home' ? 'text-teal-400 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-base">🏠</span>
            <span className="text-[10px] tracking-tight mt-0.5">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('checkFare')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'checkFare' ? 'text-rose-400 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-base">⚖️</span>
            <span className="text-[10px] tracking-tight mt-0.5">Fare</span>
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'plan' ? 'text-indigo-400 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-base">🗺️</span>
            <span className="text-[10px] tracking-tight mt-0.5">Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'explore' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-base">🍲</span>
            <span className="text-[10px] tracking-tight mt-0.5">Explore</span>
          </button>

          <button
            onClick={() => setActiveTab('tripMode')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'tripMode' ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-base">🚀</span>
            <span className="text-[10px] tracking-tight mt-0.5">Trip</span>
          </button>

          {/* Quick SOS Trigger on Thumb Zone */}
          <button
            onClick={() => setShowSosModal(true)}
            className="flex flex-col items-center py-1 px-2 rounded-xl text-rose-500 hover:text-rose-400 active:scale-95 transition-all"
            title="Emergency SOS 112 & WhatsApp"
          >
            <span className="text-base animate-pulse">🚨</span>
            <span className="text-[10px] font-black tracking-tight mt-0.5 text-rose-400">SOS</span>
          </button>
        </div>
      </div>

      {/* Floating AI Bubble above bottom nav */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-16 sm:bottom-16 right-4 z-40 bg-gradient-to-r from-teal-600 to-indigo-600 text-white p-3.5 rounded-2xl shadow-xl shadow-teal-600/30 flex items-center gap-2 text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Ask Trip Pilot AI Travel Companion"
      >
        <Bot className="h-5 w-5" />
        <span className="hidden sm:inline">{t.askAiCompanion}</span>
      </button>

      {/* Multilingual AI Modal with Gemini & Voice */}
      <AIChatModal
        currentLang={currentLang}
        originLocation={location}
        destinationName={destinationName}
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      {/* 1-Click Hackathon Scenarios Modal */}
      <HackathonScenariosModal
        isOpen={showScenariosModal}
        onClose={() => setShowScenariosModal(false)}
        onSelectScenario={handleSelectScenario}
      />

      {/* Persistent Emergency SOS Hub Modal */}
      <EmergencySosModal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
        currentCoords={{ lat: location.lat, lng: location.lng }}
        currentAddress={location.address}
      />

    </div>
  );
}
