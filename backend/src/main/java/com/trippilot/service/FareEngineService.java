package com.trippilot.service;

import com.trippilot.model.FareData;
import com.trippilot.repository.FareDataRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class FareEngineService {

    private final FareDataRepository fareDataRepository;

    public FareEngineService(FareDataRepository fareDataRepository) {
        this.fareDataRepository = fareDataRepository;
    }

    public double[] calculateFairRange(String transportationType, String city, double distanceKm, int passengers) {
        String type = transportationType != null ? transportationType.toUpperCase() : "AUTO";
        String cityName = (city != null && !city.isBlank()) ? city : "Visakhapatnam";

        FareData fareData = fareDataRepository.findByTransportationTypeIgnoreCaseAndCityIgnoreCase(type, cityName)
                .orElse(fareDataRepository.findFirstByTransportationTypeIgnoreCase(type)
                        .orElse(getDefaultFareData(type)));

        double baseFare = fareData.getBaseFare();
        double perKm = fareData.getPerKmRate();
        double minFare = fareData.getMinimumFare();

        double rawCost;
        if (type.equals("WALK")) {
            return new double[]{0.0, 0.0};
        } else if (type.equals("BUS")) {
            // Stage-based bus ticketing
            rawCost = Math.max(minFare, baseFare + (Math.ceil(distanceKm / 2.0) * perKm));
            double minRange = Math.max(minFare, Math.floor(rawCost * 0.9));
            double maxRange = Math.ceil(rawCost * 1.15);
            return new double[]{minRange, maxRange};
        } else if (type.equals("TRAIN")) {
            rawCost = Math.max(minFare, baseFare + (distanceKm * perKm));
            return new double[]{Math.floor(rawCost), Math.ceil(rawCost * 1.2)};
        } else if (type.equals("CAB")) {
            rawCost = Math.max(minFare, baseFare + (Math.max(0, distanceKm - 2.0) * perKm));
            return new double[]{Math.floor(rawCost * 0.9), Math.ceil(rawCost * 1.2)};
        } else if (type.equals("SHARED_CAB")) {
            rawCost = Math.max(minFare, baseFare + (distanceKm * perKm));
            return new double[]{Math.floor(rawCost * 0.85), Math.ceil(rawCost * 1.15)};
        } else {
            // Default AUTO: base fare covers first 1.5 - 2 km, then per km rate
            double billableKm = Math.max(0.0, distanceKm - 1.5);
            rawCost = Math.max(minFare, baseFare + (billableKm * perKm));
            // Round to nearest 5 or 10 rupees like Indian auto fare
            double minRange = Math.max(minFare, Math.floor(rawCost / 5.0) * 5.0);
            double maxRange = Math.max(minRange + 10.0, Math.ceil((rawCost * 1.25) / 5.0) * 5.0);
            return new double[]{minRange, maxRange};
        }
    }

    public Map<String, Double> getBreakdown(String transportationType, double distanceKm, double midFare) {
        Map<String, Double> breakdown = new LinkedHashMap<>();
        String type = transportationType != null ? transportationType.toUpperCase() : "AUTO";

        if (type.equals("CAB")) {
            double base = 60.0;
            double distanceCharge = Math.max(0, midFare - base - 20.0);
            breakdown.put("Base Fare", base);
            breakdown.put("Distance Charge (" + String.format("%.1f", distanceKm) + " km)", Math.round(distanceCharge * 100.0) / 100.0);
            breakdown.put("Service & Platform Fee", 20.0);
            breakdown.put("Estimated Tolls / Parking", 0.0);
        } else if (type.equals("BUS")) {
            breakdown.put("Stage Ticket Fare", midFare);
            breakdown.put("Toll & Cess", 0.0);
        } else if (type.equals("WALK")) {
            breakdown.put("Total Cost", 0.0);
        } else {
            // Auto
            double base = 20.0;
            double distCharge = Math.max(0, midFare - base);
            breakdown.put("Base Fare (Flag Drop)", base);
            breakdown.put("Distance Fare (" + String.format("%.1f", distanceKm) + " km)", Math.round(distCharge * 100.0) / 100.0);
            breakdown.put("Waiting / Extra Charges", 0.0);
        }
        return breakdown;
    }

    private FareData getDefaultFareData(String type) {
        return switch (type) {
            case "BUS" -> new FareData("BUS", "Visakhapatnam", 10.0, 3.0, 10.0, 0.0, 1.0, "2026-01-01");
            case "CAB" -> new FareData("CAB", "Visakhapatnam", 60.0, 18.0, 80.0, 2.0, 1.0, "2026-01-01");
            case "SHARED_CAB" -> new FareData("SHARED_CAB", "Visakhapatnam", 20.0, 8.0, 25.0, 0.0, 1.0, "2026-01-01");
            case "TRAIN" -> new FareData("TRAIN", "Visakhapatnam", 30.0, 0.8, 30.0, 0.0, 1.0, "2026-01-01");
            default -> new FareData("AUTO", "Visakhapatnam", 20.0, 12.0, 20.0, 1.0, 1.0, "2026-01-01");
        };
    }
}
