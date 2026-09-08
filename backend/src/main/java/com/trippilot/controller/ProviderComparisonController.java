package com.trippilot.controller;

import com.trippilot.service.ProviderComparisonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/providers")
@CrossOrigin(origins = "*")
public class ProviderComparisonController {

    private final ProviderComparisonService providerComparisonService;

    public ProviderComparisonController(ProviderComparisonService providerComparisonService) {
        this.providerComparisonService = providerComparisonService;
    }

    @GetMapping("/compare")
    public ResponseEntity<ProviderComparisonService.ComparisonResult> compareProvidersGet(
            @RequestParam(defaultValue = "Visakhapatnam") String city,
            @RequestParam(defaultValue = "Current Location") String origin,
            @RequestParam(defaultValue = "City Center") String destination,
            @RequestParam(defaultValue = "3.5") double distanceKm,
            @RequestParam(required = false) Double pickupLat,
            @RequestParam(required = false) Double pickupLon,
            @RequestParam(required = false) Double dropLat,
            @RequestParam(required = false) Double dropLon) {

        return ResponseEntity.ok(providerComparisonService.compareProviders(
                city, origin, destination, distanceKm, pickupLat, pickupLon, dropLat, dropLon));
    }

    @PostMapping("/compare")
    public ResponseEntity<ProviderComparisonService.ComparisonResult> compareProvidersPost(
            @RequestBody Map<String, Object> payload) {

        String city = payload.getOrDefault("city", "Visakhapatnam").toString();
        String origin = payload.getOrDefault("origin", "Current Location").toString();
        String destination = payload.getOrDefault("destination", "City Center").toString();

        double distanceKm = 3.5;
        if (payload.get("distanceKm") != null) {
            try {
                distanceKm = Double.parseDouble(payload.get("distanceKm").toString());
            } catch (Exception ignored) {}
        }

        Double pickupLat = payload.get("pickupLat") != null ? Double.parseDouble(payload.get("pickupLat").toString()) : null;
        Double pickupLon = payload.get("pickupLon") != null ? Double.parseDouble(payload.get("pickupLon").toString()) : null;
        Double dropLat = payload.get("dropLat") != null ? Double.parseDouble(payload.get("dropLat").toString()) : null;
        Double dropLon = payload.get("dropLon") != null ? Double.parseDouble(payload.get("dropLon").toString()) : null;

        return ResponseEntity.ok(providerComparisonService.compareProviders(
                city, origin, destination, distanceKm, pickupLat, pickupLon, dropLat, dropLon));
    }
}
