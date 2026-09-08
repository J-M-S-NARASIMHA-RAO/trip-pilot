package com.trippilot.service;

import com.trippilot.dto.TransportOptionDTO;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SmartRecommendationEngine {

    private final FareEngineService fareEngineService;

    public SmartRecommendationEngine(FareEngineService fareEngineService) {
        this.fareEngineService = fareEngineService;
    }

    public List<TransportOptionDTO> evaluateOptions(String source, String destination, double distanceKm, int travelers, Double budget, String userMode, String city) {
        List<TransportOptionDTO> options = new ArrayList<>();
        int pax = Math.max(1, travelers);
        String mode = (userMode != null) ? userMode.toUpperCase() : "TOURIST";

        // 1. PUBLIC BUS
        double[] busRange = fareEngineService.calculateFairRange("BUS", city, distanceKm, pax);
        double busPerPerson = busRange[0];
        double busTotal = busPerPerson * pax;
        int busDuration = (int) Math.round(distanceKm * 4.5) + 10; // includes wait & stops
        TransportOptionDTO bus = new TransportOptionDTO();
        bus.setType("BUS");
        bus.setTitle("APSRTC City Bus");
        bus.setProvider("APSRTC Metro Express");
        bus.setEstimatedFareMin(busRange[0]);
        bus.setEstimatedFareMax(busRange[1]);
        bus.setTotalCost(busTotal);
        bus.setCostPerPerson(busPerPerson);
        bus.setDurationMinutes(busDuration);
        bus.setConvenience("MEDIUM");
        bus.setStatusRisk("TRANSPARENT");
        bus.setCostBreakdown(Map.of("Ticket / Head", busPerPerson, "Total (" + pax + " pax)", busTotal));
        bus.setStepsSummary("Board at nearest bus stop -> Direct drop at destination complex");
        options.add(bus);

        // 2. AUTO (Rikshaw)
        double[] autoRange = fareEngineService.calculateFairRange("AUTO", city, distanceKm, pax);
        double autoTotal = (autoRange[0] + autoRange[1]) / 2.0;
        int autoVehiclesNeeded = (int) Math.ceil((double) pax / 3.0); // max 3-4 per auto
        autoTotal = autoTotal * autoVehiclesNeeded;
        double autoPerPerson = autoTotal / pax;
        int autoDuration = (int) Math.round(distanceKm * 2.8) + 4;
        TransportOptionDTO auto = new TransportOptionDTO();
        auto.setType("AUTO");
        auto.setTitle("Local Auto Rickshaw");
        auto.setProvider("Regulated Meter / Auto Stand");
        auto.setEstimatedFareMin(autoRange[0] * autoVehiclesNeeded);
        auto.setEstimatedFareMax(autoRange[1] * autoVehiclesNeeded);
        auto.setTotalCost(autoTotal);
        auto.setCostPerPerson(autoPerPerson);
        auto.setDurationMinutes(autoDuration);
        auto.setConvenience("HIGH");
        auto.setStatusRisk("TRANSPARENT");
        auto.setCostBreakdown(fareEngineService.getBreakdown("AUTO", distanceKm, autoTotal));
        auto.setStepsSummary("Direct point-to-point drop; agile in city traffic");
        options.add(auto);

        // 3. CAB / TAXI (Cab / Uber / Ola / FastTrack)
        double[] cabRange = fareEngineService.calculateFairRange("CAB", city, distanceKm, pax);
        double cabTotal = (cabRange[0] + cabRange[1]) / 2.0;
        int cabVehiclesNeeded = (int) Math.ceil((double) pax / 4.0);
        cabTotal = cabTotal * cabVehiclesNeeded;
        double cabPerPerson = cabTotal / pax;
        int cabDuration = (int) Math.round(distanceKm * 2.2) + 5;
        TransportOptionDTO cab = new TransportOptionDTO();
        cab.setType("CAB");
        cab.setTitle("App Cab / Prepaid Taxi");
        cab.setProvider("AC Sedans / Hatchback");
        cab.setEstimatedFareMin(cabRange[0] * cabVehiclesNeeded);
        cab.setEstimatedFareMax(cabRange[1] * cabVehiclesNeeded);
        cab.setTotalCost(cabTotal);
        cab.setCostPerPerson(cabPerPerson);
        cab.setDurationMinutes(cabDuration);
        cab.setConvenience("VERY_HIGH");
        cab.setStatusRisk("LOW_RISK");
        cab.setCostBreakdown(fareEngineService.getBreakdown("CAB", distanceKm, cabTotal));
        cab.setStepsSummary("Air-conditioned comfort with GPS live tracking and digital receipt");
        options.add(cab);

        // 4. SHARED CAB / AUTO
        if (distanceKm > 1.5) {
            double[] sharedRange = fareEngineService.calculateFairRange("SHARED_CAB", city, distanceKm, pax);
            double sharedPerPerson = sharedRange[0];
            double sharedTotal = sharedPerPerson * pax;
            int sharedDuration = autoDuration + 6;
            TransportOptionDTO shared = new TransportOptionDTO();
            shared.setType("SHARED_CAB");
            shared.setTitle("Shared Auto / Shuttle");
            shared.setProvider("RTC Route Share");
            shared.setEstimatedFareMin(sharedRange[0]);
            shared.setEstimatedFareMax(sharedRange[1]);
            shared.setTotalCost(sharedTotal);
            shared.setCostPerPerson(sharedPerPerson);
            shared.setDurationMinutes(sharedDuration);
            shared.setConvenience("MEDIUM");
            shared.setStatusRisk("TRANSPARENT");
            shared.setCostBreakdown(Map.of("Fixed Share Rate", sharedPerPerson, "Total Group", sharedTotal));
            shared.setStepsSummary("Hop-on hop-off shared route along main arterial road");
            options.add(shared);
        }

        // 5. WALKING (if <= 3.0 km)
        if (distanceKm <= 3.5) {
            int walkDuration = (int) Math.round(distanceKm * 12.0);
            TransportOptionDTO walk = new TransportOptionDTO();
            walk.setType("WALK");
            walk.setTitle("Walking Route");
            walk.setProvider("Pedestrian Footpaths");
            walk.setEstimatedFareMin(0.0);
            walk.setEstimatedFareMax(0.0);
            walk.setTotalCost(0.0);
            walk.setCostPerPerson(0.0);
            walk.setDurationMinutes(walkDuration);
            walk.setConvenience("LOW");
            walk.setStatusRisk("TRANSPARENT");
            walk.setCostBreakdown(Map.of("Cost", 0.0));
            walk.setStepsSummary("Zero carbon, healthy sidewalk stroll with pedestrian crossings");
            options.add(walk);
        }

        // Weights:
        // Student: Cost 50%, Time 20%, Safety 15%, Convenience 15%
        // Tourist: Cost 25%, Time 25%, Safety 25%, Convenience 25%
        double costWeight = mode.equals("STUDENT") ? 0.50 : 0.30;
        double timeWeight = mode.equals("STUDENT") ? 0.20 : 0.25;
        double convWeight = mode.equals("STUDENT") ? 0.15 : 0.25;
        double safeWeight = mode.equals("STUDENT") ? 0.15 : 0.20;

        List<TransportOptionDTO> vehicular = options.stream().filter(o -> !o.getType().equals("WALK")).toList();
        double minCost = vehicular.stream().mapToDouble(TransportOptionDTO::getTotalCost).min().orElse(1.0);
        double maxCost = Math.max(1.0, vehicular.stream().mapToDouble(TransportOptionDTO::getTotalCost).max().orElse(100.0));
        double minTime = options.stream().mapToDouble(TransportOptionDTO::getDurationMinutes).min().orElse(1.0);
        double maxTime = Math.max(1.0, options.stream().mapToDouble(TransportOptionDTO::getDurationMinutes).max().orElse(60.0));

        for (TransportOptionDTO opt : options) {
            double costScore = 100.0 - (((opt.getTotalCost() - minCost) / (maxCost - minCost + 0.001)) * 100.0);
            if (opt.getType().equals("WALK")) costScore = 80.0; // cap walking cost boost
            double timeScore = 100.0 - (((opt.getDurationMinutes() - minTime) / (maxTime - minTime + 0.001)) * 100.0);
            double convScore = switch (opt.getConvenience()) {
                case "VERY_HIGH" -> 100.0;
                case "HIGH" -> 85.0;
                case "MEDIUM" -> 65.0;
                default -> 25.0;
            };
            double safeScore = switch (opt.getType()) {
                case "BUS" -> 95.0;
                case "CAB" -> 90.0;
                case "AUTO" -> 85.0;
                case "SHARED_CAB" -> 75.0;
                default -> 40.0; // walking on Indian roads
            };

            double totalScore = (costScore * costWeight) + (timeScore * timeWeight) + (convScore * convWeight) + (safeScore * safeWeight);
            opt.setScore(Math.round(totalScore * 10.0) / 10.0);
        }

        // Cheapest vehicular
        TransportOptionDTO cheapest = vehicular.stream()
                .min(Comparator.comparingDouble(TransportOptionDTO::getTotalCost))
                .orElse(vehicular.get(0));
        cheapest.setBadge("CHEAPEST");

        // Fastest
        TransportOptionDTO fastest = options.stream()
                .min(Comparator.comparingInt(TransportOptionDTO::getDurationMinutes))
                .orElse(options.get(0));
        if (fastest.getBadge() == null) {
            fastest.setBadge("FASTEST");
        }

        // Safest
        options.stream().filter(o -> o.getType().equals("BUS")).findFirst().ifPresent(b -> {
            if (b.getBadge() == null) b.setBadge("SAFEST");
        });

        // Best Overall (must be vehicular)
        TransportOptionDTO bestOverall = vehicular.stream()
                .max(Comparator.comparingDouble(TransportOptionDTO::getScore))
                .orElse(vehicular.get(0));
        bestOverall.setBadge("BEST_OVERALL");

        // Explainability reasons
        for (TransportOptionDTO opt : options) {
            StringBuilder why = new StringBuilder();
            if ("BEST_OVERALL".equals(opt.getBadge())) {
                why.append("⭐ Highest value balance: fast travel time (")
                   .append(opt.getDurationMinutes()).append("m), reasonable fare of ₹")
                   .append(Math.round(opt.getTotalCost()))
                   .append(pax > 1 ? " (₹" + Math.round(opt.getCostPerPerson()) + "/person)" : "")
                   .append(", and good convenience for ").append(pax).append(" passenger(s).");
            } else if ("CHEAPEST".equals(opt.getBadge())) {
                why.append("💰 Lowest monetary expenditure: saves maximum money at ₹")
                   .append(Math.round(opt.getTotalCost()))
                   .append(" total, ideal for strict budgets.");
            } else if ("FASTEST".equals(opt.getBadge())) {
                why.append("⚡ Shortest transit duration: takes only ")
                   .append(opt.getDurationMinutes()).append(" mins, minimizing delay through congestion.");
            } else if ("SAFEST".equals(opt.getBadge())) {
                why.append("🛡️ High safety & reliability: regulated state transit with fixed tariff and zero price deviation.");
            } else {
                why.append("Practical alternative offering balanced budget and convenience.");
            }
            opt.setWhyChosen(why.toString());
        }

        // Sort descending by score
        options.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        return options;
    }
}