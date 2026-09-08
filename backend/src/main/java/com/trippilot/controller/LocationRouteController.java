package com.trippilot.controller;

import com.trippilot.model.TransitHub;
import com.trippilot.repository.TransitHubRepository;
import com.trippilot.service.DistanceCalculationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/location")
@CrossOrigin(origins = "*")
public class LocationRouteController {

    private final DistanceCalculationService distanceCalculationService;
    private final TransitHubRepository transitHubRepository;

    public LocationRouteController(DistanceCalculationService distanceCalculationService,
                                   TransitHubRepository transitHubRepository) {
        this.distanceCalculationService = distanceCalculationService;
        this.transitHubRepository = transitHubRepository;
    }

    @GetMapping("/route")
    public ResponseEntity<DistanceCalculationService.RouteSummary> getRoute(
            @RequestParam double startLat,
            @RequestParam double startLon,
            @RequestParam double endLat,
            @RequestParam double endLon) {

        return ResponseEntity.ok(distanceCalculationService.calculateRoute(startLat, startLon, endLat, endLon));
    }

    @PostMapping("/route")
    public ResponseEntity<DistanceCalculationService.RouteSummary> postRoute(
            @RequestBody Map<String, Double> coords) {

        double startLat = coords.getOrDefault("startLat", 17.7215);
        double startLon = coords.getOrDefault("startLon", 83.2985);
        double endLat = coords.getOrDefault("endLat", 17.7280);
        double endLon = coords.getOrDefault("endLon", 83.3030);

        return ResponseEntity.ok(distanceCalculationService.calculateRoute(startLat, startLon, endLat, endLon));
    }

    @GetMapping("/hubs")
    public ResponseEntity<List<TransitHub>> getHubs(@RequestParam(defaultValue = "Visakhapatnam") String city) {
        return ResponseEntity.ok(transitHubRepository.findByCityIgnoreCase(city));
    }
}
