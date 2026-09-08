import React from 'react';
import { Compass, ShieldCheck, Globe, GraduationCap, MapPin, Sparkles, Utensils } from 'lucide-react';
import { translations } from '../translations';

export default function Navbar({ currentLang, setLang, activeTab, setActiveTab, userMode, setUserMode, onOpenScenarios, onOpenSos }) {
  const t = translations[currentLang] || translations.en;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 ring-2 ring-white">
              <Compass className="h-6 w-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
                  {t.appTitle}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="h-3 w-3" /> Anti-Deception
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'home' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.navHome}
            </button>
            <button
              onClick={() => setActiveTab('checkFare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'checkFare' ? 'bg-red-500 text-white shadow-sm shadow-red-500/30' : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {t.navCheckFare}
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'plan' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.navPlan}
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'map' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.navMap}
            </button>
            <button
              onClick={() => setActiveTab('tripMode')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'tripMode' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.navTripMode}
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'explore' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.navExplore}
            </button>
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeTab === 'restaurants' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Utensils className="h-3.5 w-3.5" />
              {t.navRestaurants}
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t.navAI}
            </button>
          </nav>

          {/* Right Controls: Jury Scenarios, SOS, Student/Tourist Toggle & Language Switcher */}
          <div className="flex items-center gap-2">
            {/* 1-Click Jury Presets */}
            {onOpenScenarios && (
              <button
                onClick={onOpenScenarios}
                className="flex items-center gap-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 border border-amber-400/40 text-xs font-black px-2.5 py-1.5 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
                title="1-Click Jury Demonstration Scenarios across 5 cities"
              >
                <span>🏆</span>
                <span className="hidden sm:inline">Jury Scenarios</span>
              </button>
            )}

            {/* Persistent SOS Button */}
            {onOpenSos && (
              <button
                onClick={onOpenSos}
                className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-2.5 py-1.5 rounded-xl transition-all shadow-md shadow-rose-600/20 active:scale-95 cursor-pointer"
                title="Emergency SOS (112, 1091 & WhatsApp Live Broadcast)"
              >
                <span className="animate-pulse">🚨</span>
                <span>SOS</span>
              </button>
            )}
            {/* Student Mode Toggle */}
            <button
              onClick={() => setUserMode(userMode === 'STUDENT' ? 'TOURIST' : 'STUDENT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                userMode === 'STUDENT'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Toggle Student vs Tourist travel optimization"
            >
              <GraduationCap className="h-4 w-4 text-amber-700" />
              <span className="hidden sm:inline">
                {userMode === 'STUDENT' ? t.modeStudent : t.modeTourist}
              </span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <Globe className="h-3.5 w-3.5 text-slate-500 ml-1.5 mr-1" />
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  currentLang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('te')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  currentLang === 'te' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="తెలుగు"
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  currentLang === 'hi' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="हिन्दी"
              >
                हिन्दी
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}