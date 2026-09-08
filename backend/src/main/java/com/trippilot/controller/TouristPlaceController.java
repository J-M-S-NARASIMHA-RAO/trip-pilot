package com.trippilot.controller;

import com.trippilot.model.TouristPlace;
import com.trippilot.service.TouristGuideService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tourist-places")
@CrossOrigin(origins = "*")
public class TouristPlaceController {

    private final TouristGuideService touristGuideService;

    public TouristPlaceController(TouristGuideService touristGuideService) {
        this.touristGuideService = touristGuideService;
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<TouristPlace>> getNearbyPlaces(@RequestParam(defaultValue = "Visakhapatnam") String city) {
        return ResponseEntity.ok(touristGuideService.getPlacesByCity(city));
    }

    @GetMapping("/itinerary")
    public ResponseEntity<Map<String, Object>> getBudgetItinerary(@RequestParam(defaultValue = "Visakhapatnam Railway Station") String startingLocation,
                                                                  @RequestParam(defaultValue = "6") int hours,
                                                                  @RequestParam(defaultValue = "500") double budget,
                                                                  @RequestParam(defaultValue = "Visakhapatnam") String city) {
        return ResponseEntity.ok(touristGuideService.generateBudgetItinerary(startingLocation, hours, budget, city));
    }
}
