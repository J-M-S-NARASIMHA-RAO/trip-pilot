import React, { useState } from 'react';
import { Bus, Navigation, Footprints, Clock, ArrowRight, CheckCircle2, MapPin, X } from 'lucide-react';
import { findNearestBusStop } from '../services/googleMapsService';

export default function BusTransitGuide({ 
  originLocation, 
  destination, 
  isOpen, 
  onClose,
  onShowOnMap 
}) {
  if (!isOpen) return null;

  const nearestBusStop = findNearestBusStop(
    originLocation?.lat || 17.7214, 
    originLocation?.lng || 83.2929, 
    originLocation?.city || "Visakhapatnam"
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 shadow-xs">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                APSRTC Transit Guide
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                Directions to Nearest Bus Stop
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nearest Bus Stop Banner */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white shadow-md">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-teal-300 tracking-wider">
                Nearest Boarding Point
              </span>
              <h4 className="text-base font-black mt-0.5 text-white flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-rose-400" />
                {nearestBusStop.name}
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Available Routes: <strong>{nearestBusStop.routes.join(', ')}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-emerald-400 block">
                {nearestBusStop.distanceText} away
              </span>
              <span className="text-[11px] text-slate-300 font-semibold">
                ~{nearestBusStop.walkMins} mins walk
              </span>
            </div>
          </div>
        </div>

        {/* 3-Step Journey Steps */}
        <div className="space-y-3 mb-6">
          
          {/* Step 1: Walk to bus stop */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Footprints className="h-3.5 w-3.5 text-teal-600" /> Walk to {nearestBusStop.name}
                </strong>
                <span className="text-[10px] font-bold text-slate-500">{nearestBusStop.distanceText}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {nearestBusStop.directionsSummary}. Follow pedestrian footpaths from your live location.
              </p>
            </div>
          </div>

          {/* Step 2: Board bus */}
          <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-teal-950 flex items-center gap-1">
                  <Bus className="h-3.5 w-3.5 text-teal-700" /> Board Route 28A or 10K Express
                </strong>
                <span className="text-xs font-black text-teal-700 bg-white px-2 py-0.5 rounded-md border border-teal-200">₹10–₹15</span>
              </div>
              <p className="text-[11px] text-teal-800 mt-1">
                Buses arrive every 6–8 minutes. Express City Buses take Beach Road / Arterial bypass.
              </p>
            </div>
          </div>

          {/* Step 3: Arrive at destination */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1">
              <strong className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span>🎯</span> Direct Drop near {destination || "Destination"}
              </strong>
              <p className="text-[11px] text-slate-600 mt-1">
                De-board at nearest stop (within 100m of destination).
              </p>
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (onShowOnMap) onShowOnMap(nearestBusStop);
              onClose();
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Show Bus Stop on Live Map</span>
          </button>
        </div>

      </div>
    </div>
  );
}
