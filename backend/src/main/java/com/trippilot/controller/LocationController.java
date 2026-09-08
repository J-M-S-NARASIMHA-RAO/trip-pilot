package com.trippilot.controller;

import com.trippilot.model.Location;
import com.trippilot.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/location")
@CrossOrigin(origins = "*")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Map<String, Object>>> getNearbyTransport(@RequestParam(required = false) Double lat,
                                                                        @RequestParam(required = false) Double lng) {
        return ResponseEntity.ok(locationService.getNearbyTransport(lat, lng));
    }

    @GetMapping("/reverse-geocode")
    public ResponseEntity<Map<String, Object>> reverseGeocode(@RequestParam(required = false) Double lat,
                                                               @RequestParam(required = false) Double lng) {
        return ResponseEntity.ok(locationService.reverseGeocode(lat, lng));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Location>> searchLocations(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(locationService.searchLocations(q));
    }
}
