package com.trippilot.controller;

import com.trippilot.dto.TransportOptionDTO;
import com.trippilot.dto.TripPlanRequest;
import com.trippilot.dto.TripPlanResponse;
import com.trippilot.model.Route;
import com.trippilot.model.Trip;
import com.trippilot.repository.RouteRepository;
import com.trippilot.repository.TripRepository;
import com.trippilot.service.SmartRecommendationEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TripPlanController {

    private final SmartRecommendationEngine smartRecommendationEngine;
    private final RouteRepository routeRepository;
    private final TripRepository tripRepository;

    public TripPlanController(SmartRecommendationEngine smartRecommendationEngine,
                              RouteRepository routeRepository,
                              TripRepository tripRepository) {
        this.smartRecommendationEngine = smartRecommendationEngine;
        this.routeRepository = routeRepository;
        this.tripRepository = tripRepository;
    }

    @PostMapping("/trips/plan")
    public ResponseEntity<TripPlanResponse> planTrip(@RequestBody TripPlanRequest request) {
        String src = request.getSource() != null ? request.getSource() : "Visakhapatnam Railway Station";
        String dest = request.getDestination() != null ? request.getDestination() : "Vizag Complex";
        int pax = request.getTravelers() != null ? request.getTravelers() : 1;
        String mode = request.getUserMode() != null ? request.getUserMode() : "TOURIST";

        double distanceKm = 2.8;
        String lowerDest = dest.toLowerCase();
        if (lowerDest.contains("beach") || lowerDest.contains("rk")) {
            distanceKm = 5.2;
        } else if (lowerDest.contains("kailasagiri")) {
            distanceKm = 11.5;
        } else if (lowerDest.contains("rushikonda")) {
            distanceKm = 17.0;
        } else if (lowerDest.contains("submarine")) {
            distanceKm = 5.5;
        } else if (lowerDest.contains("complex") || lowerDest.contains("dwaraka")) {
            distanceKm = 2.8;
        }

        String multiStopNotice = null;
        if (request.getStops() != null && !request.getStops().isEmpty()) {
            double extraKm = request.getStops().size() * 2.5;
            distanceKm += extraKm;
            multiStopNotice = "📍 Multi-Stop Itinerary: " + src + " ➔ " + String.join(" ➔ ", request.getStops()) + " ➔ " + dest + " (Combined multi-stop ride)";
        }

        List<TransportOptionDTO> options = smartRecommendationEngine.evaluateOptions(src, dest, distanceKm, pax, request.getBudget(), mode, "Visakhapatnam");

        TripPlanResponse resp = new TripPlanResponse();
        resp.setSource(src);
        resp.setDestination(dest);
        resp.setStops(request.getStops());
        resp.setDistanceKm(Math.round(distanceKm * 10.0) / 10.0);
        resp.setEstimatedDistanceTime((int) Math.round(distanceKm * 2.8) + 4);
        resp.setTravelers(pax);
        resp.setBudget(request.getBudget());
        resp.setUserMode(mode);
        resp.setAllOptions(options);
        resp.setRecommendedOption(!options.isEmpty() ? options.get(0) : null);
        resp.setMultiStopNotice(multiStopNotice);

        if (pax > 1) {
            double autoCost = options.stream().filter(o -> o.getType().equals("AUTO")).mapToDouble(TransportOptionDTO::getTotalCost).findFirst().orElse(60.0);
            double busCost = options.stream().filter(o -> o.getType().equals("BUS")).mapToDouble(TransportOptionDTO::getTotalCost).findFirst().orElse(20.0);
            double diff = Math.max(0, autoCost - busCost);
            resp.setGroupSavingsNotice("👥 Group Travel Saver: For " + pax + " travelers, choosing the shared or public option can save your group ₹" + Math.round(diff) + " overall!");
        }

        // Save trip
        Trip trip = new Trip();
        trip.setSource(src);
        trip.setDestination(dest);
        trip.setTravelers(pax);
        trip.setBudget(request.getBudget());
        if (resp.getRecommendedOption() != null) {
            trip.setSelectedOption(resp.getRecommendedOption().getType());
            trip.setTotalCost(resp.getRecommendedOption().getTotalCost());
        }
        tripRepository.save(trip);

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/trip/optimize")
    public ResponseEntity<TripPlanResponse> optimizeTrip(@RequestBody TripPlanRequest request) {
        return planTrip(request);
    }

    @GetMapping("/trips/{id}")
    public ResponseEntity<Trip> getTrip(@PathVariable Long id) {
        return tripRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/transport/options")
    public ResponseEntity<List<TransportOptionDTO>> getTransportOptions(@RequestParam(defaultValue = "2.8") double distanceKm,
                                                                        @RequestParam(defaultValue = "1") int travelers,
                                                                        @RequestParam(defaultValue = "TOURIST") String userMode) {
        return ResponseEntity.ok(smartRecommendationEngine.evaluateOptions("Visakhapatnam Railway Station", "Vizag Complex", distanceKm, travelers, null, userMode, "Visakhapatnam"));
    }

    @GetMapping("/routes")
    public ResponseEntity<List<Route>> getRoutes() {
        return ResponseEntity.ok(routeRepository.findAll());
    }
}