package com.trippilot.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DistanceCalculationService {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double ROAD_WINDING_FACTOR = 1.32; // Standard urban Indian road network winding factor

    public static class RouteSummary {
        private double haversineDistanceKm;
        private double roadDistanceKm;
        private Map<String, Integer> estimatedMinutesByMode;
        private String formattedDistance;

        public RouteSummary() {}

        public RouteSummary(double haversineDistanceKm, double roadDistanceKm, Map<String, Integer> estimatedMinutesByMode) {
            this.haversineDistanceKm = Math.round(haversineDistanceKm * 100.0) / 100.0;
            this.roadDistanceKm = Math.round(roadDistanceKm * 100.0) / 100.0;
            this.estimatedMinutesByMode = estimatedMinutesByMode;
            this.formattedDistance = String.format("%.2f km", this.roadDistanceKm);
        }

        public double getHaversineDistanceKm() { return haversineDistanceKm; }
        public double getRoadDistanceKm() { return roadDistanceKm; }
        public Map<String, Integer> getEstimatedMinutesByMode() { return estimatedMinutesByMode; }
        public String getFormattedDistance() { return formattedDistance; }
    }

    /**
     * Compute Haversine distance between two coordinates in kilometers.
     */
    public double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        if (lat1 == lat2 && lon1 == lon2) {
            return 0.0;
        }
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);

        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Estimates actual road driving distance using empirical road winding factor 1.32.
     */
    public double calculateRoadDistance(double lat1, double lon1, double lat2, double lon2) {
        double hav = calculateHaversineDistance(lat1, lon1, lat2, lon2);
        if (hav <= 0.05) return Math.max(0.05, hav);
        return Math.round((hav * ROAD_WINDING_FACTOR) * 100.0) / 100.0;
    }

    /**
     * Computes multi-modal speed-profiled travel times in minutes.
     * Modes: WALK (4.5 km/h), BIKE (24 km/h), AUTO (28 km/h), CAB (32 km/h), BUS (18 km/h).
     */
    public Map<String, Integer> getMultiModalEtas(double roadDistKm) {
        Map<String, Integer> etas = new LinkedHashMap<>();
        etas.put("WALK", (int) Math.max(1, Math.round((roadDistKm / 4.5) * 60)));
        etas.put("BIKE", (int) Math.max(2, Math.round((roadDistKm / 24.0) * 60) + 2)); // 2 min pickup buffer
        etas.put("AUTO", (int) Math.max(3, Math.round((roadDistKm / 28.0) * 60) + 3));
        etas.put("CAB", (int) Math.max(4, Math.round((roadDistKm / 32.0) * 60) + 4));
        etas.put("BUS", (int) Math.max(5, Math.round((roadDistKm / 18.0) * 60) + 7)); // 7 min waiting/dwell buffer
        return etas;
    }

    /**
     * Full route analysis.
     */
    public RouteSummary calculateRoute(double startLat, double startLon, double endLat, double endLon) {
        double hav = calculateHaversineDistance(startLat, startLon, endLat, endLon);
        double road = calculateRoadDistance(startLat, startLon, endLat, endLon);
        Map<String, Integer> etas = getMultiModalEtas(road);
        return new RouteSummary(hav, road, etas);
    }
}
