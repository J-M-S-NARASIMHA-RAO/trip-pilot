package com.trippilot.service;

import com.trippilot.model.Location;
import com.trippilot.repository.LocationRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class LocationService {

    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public List<Location> getLocationsByCity(String city) {
        return locationRepository.findByCityIgnoreCase(city);
    }

    public List<Location> searchLocations(String query) {
        if (query == null || query.isBlank()) {
            return locationRepository.findAll();
        }
        return locationRepository.findByNameContainingIgnoreCase(query);
    }

    public Location getOrCreateLocation(String name, String city, Double lat, Double lng) {
        return locationRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            Location loc = new Location(name, lat != null ? lat : 17.7214, lng != null ? lng : 83.2929, city, "LANDMARK", name);
            return locationRepository.save(loc);
        });
    }

    public Map<String, Object> reverseGeocode(Double lat, Double lng) {
        Map<String, Object> res = new HashMap<>();
        // Default to Vizag Railway Station if coordinates near 17.72, 83.29
        if (lat == null || lng == null) {
            res.put("name", "Visakhapatnam Railway Station");
            res.put("city", "Visakhapatnam");
            res.put("address", "Station Rd, Railway Quarters, Visakhapatnam, Andhra Pradesh 530004");
            res.put("latitude", 17.7214);
            res.put("longitude", 83.2929);
            return res;
        }

        // Find nearest seeded location
        List<Location> all = locationRepository.findAll();
        Location nearest = null;
        double minDistance = Double.MAX_VALUE;

        for (Location loc : all) {
            double d = calculateHaversine(lat, lng, loc.getLatitude(), loc.getLongitude());
            if (d < minDistance) {
                minDistance = d;
                nearest = loc;
            }
        }

        if (nearest != null && minDistance < 5.0) {
            res.put("name", nearest.getName());
            res.put("city", nearest.getCity());
            res.put("address", nearest.getAddress());
            res.put("latitude", nearest.getLatitude());
            res.put("longitude", nearest.getLongitude());
            res.put("distanceFromMarkerKm", Math.round(minDistance * 100.0) / 100.0);
        } else {
            res.put("name", "Visakhapatnam Railway Station");
            res.put("city", "Visakhapatnam");
            res.put("address", "Station Rd, Railway Quarters, Visakhapatnam, Andhra Pradesh 530004");
            res.put("latitude", lat);
            res.put("longitude", lng);
        }
        return res;
    }

    public List<Map<String, Object>> getNearbyTransport(Double lat, Double lng) {
        List<Map<String, Object>> list = new ArrayList<>();
        double baseLat = (lat != null) ? lat : 17.7214;
        double baseLng = (lng != null) ? lng : 83.2929;

        list.add(Map.of(
            "type", "AUTO_STAND",
            "name", "Station Main Gate Auto Stand",
            "distanceMeters", 100,
            "estimatedFairToCenter", "₹20–₹30",
            "availableVehicles", "12 Autos waiting",
            "lat", baseLat + 0.0008,
            "lng", baseLng + 0.0006
        ));

        list.add(Map.of(
            "type", "BUS_STOP",
            "name", "Railway Station Bus Stop (RTC)",
            "distanceMeters", 250,
            "estimatedFairToCenter", "₹10–₹15",
            "availableVehicles", "Routes 28A, 10K, 38 arriving in 3 mins",
            "lat", baseLat + 0.0019,
            "lng", baseLng + 0.0014
        ));

        list.add(Map.of(
            "type", "CAB_PICKUP",
            "name", "Prepaid Taxi / App Cab Pickup Bay",
            "distanceMeters", 300,
            "estimatedFairToCenter", "₹80–₹120",
            "availableVehicles", "Uber / Ola 4 mins away",
            "lat", baseLat - 0.0015,
            "lng", baseLng + 0.0020
        ));

        list.add(Map.of(
            "type", "RAILWAY_STATION",
            "name", "Visakhapatnam Junction (VSKP)",
            "distanceMeters", 0,
            "estimatedFairToCenter", "Platform 1 & 8 exits",
            "availableVehicles", "Major Rail Hub",
            "lat", baseLat,
            "lng", baseLng
        ));

        return list;
    }

    public double calculateHaversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in KM
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
