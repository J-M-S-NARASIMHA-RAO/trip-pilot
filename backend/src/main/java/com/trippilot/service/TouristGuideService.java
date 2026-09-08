package com.trippilot.service;

import com.trippilot.model.TouristPlace;
import com.trippilot.repository.TouristPlaceRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TouristGuideService {

    private final TouristPlaceRepository touristPlaceRepository;

    public TouristGuideService(TouristPlaceRepository touristPlaceRepository) {
        this.touristPlaceRepository = touristPlaceRepository;
    }

    public List<TouristPlace> getPlacesByCity(String city) {
        String queryCity = (city != null && !city.isBlank()) ? city : "Visakhapatnam";
        return touristPlaceRepository.findByCityIgnoreCase(queryCity);
    }

    public Map<String, Object> generateBudgetItinerary(String startingPoint, int availableHours, double totalBudget, String city) {
        Map<String, Object> plan = new LinkedHashMap<>();
        double budget = totalBudget > 0 ? totalBudget : 500.0;
        int hours = availableHours > 0 ? availableHours : 6;
        String queryCity = (city != null && !city.isBlank()) ? city : "Visakhapatnam";
        String start = (startingPoint != null && !startingPoint.isBlank()) ? startingPoint : (queryCity + " Central Station");

        plan.put("title", "₹" + Math.round(budget) + " Smart Budget Explorer (" + hours + " Hours)");
        plan.put("startingLocation", start);
        plan.put("city", queryCity);
        plan.put("totalBudget", budget);

        List<TouristPlace> cityPlaces = touristPlaceRepository.findByCityIgnoreCase(queryCity);
        List<Map<String, Object>> stops = new ArrayList<>();
        double transportTotal = 0;
        double foodTotal = 0;
        double entryFeesTotal = 0;

        stops.add(Map.of(
            "time", "10:00 AM",
            "place", start,
            "activity", "Journey begins; board public transit or budget shuttle towards city center",
            "transportCost", 15.0,
            "entryFee", 0.0,
            "category", "START"
        ));
        transportTotal += 15.0;

        String[] times = new String[]{"10:45 AM", "12:00 PM", "02:30 PM", "04:00 PM"};
        int placeIdx = 0;

        if (cityPlaces != null && !cityPlaces.isEmpty()) {
            for (TouristPlace p : cityPlaces) {
                if (placeIdx >= times.length) break;
                double cost = p.getEntryFee() != null ? p.getEntryFee() : 0.0;
                if (transportTotal + foodTotal + entryFeesTotal + cost + 50.0 > budget && placeIdx > 0) {
                    continue; // Skip expensive places if budget exceeded
                }
                stops.add(Map.of(
                    "time", times[placeIdx],
                    "place", p.getName(),
                    "activity", p.getDescription() != null ? p.getDescription() : "Explore historical & cultural highlights",
                    "transportCost", placeIdx == 0 ? 0.0 : 20.0,
                    "entryFee", cost,
                    "category", p.getCategory() != null ? p.getCategory() : "ATTRACTION"
                ));
                if (placeIdx > 0) transportTotal += 20.0;
                entryFeesTotal += cost;
                placeIdx++;

                // Add lunch break after 2nd attraction
                if (placeIdx == 2) {
                    double lunchCost = Math.min(150.0, Math.max(70.0, budget * 0.25));
                    stops.add(Map.of(
                        "time", "01:15 PM",
                        "place", queryCity + " Authentic Budget Food Lane",
                        "activity", "Delicious regional thali meals and street snacks under budget",
                        "transportCost", 0.0,
                        "entryFee", 0.0,
                        "foodCost", lunchCost,
                        "category", "FOOD"
                    ));
                    foodTotal += lunchCost;
                }
            }
        } else {
            // Default fallback
            stops.add(Map.of(
                "time", "10:45 AM",
                "place", queryCity + " Main Heritage Point",
                "activity", "Explore local heritage and historic landmarks",
                "transportCost", 15.0,
                "entryFee", 20.0,
                "category", "HERITAGE"
            ));
            transportTotal += 15.0;
            entryFeesTotal += 20.0;

            stops.add(Map.of(
                "time", "01:15 PM",
                "place", queryCity + " Local Market Food Stalls",
                "activity", "Authentic regional lunch meal",
                "transportCost", 0.0,
                "entryFee", 0.0,
                "foodCost", 120.0,
                "category", "FOOD"
            ));
            foodTotal += 120.0;
        }

        stops.add(Map.of(
            "time", "05:00 PM",
            "place", "Return to " + start,
            "activity", "Return trip via city express bus or shared shuttle",
            "transportCost", 20.0,
            "entryFee", 0.0,
            "category", "END"
        ));
        transportTotal += 20.0;

        double grandTotal = transportTotal + foodTotal + entryFeesTotal;
        double remainingSavings = Math.max(0, budget - grandTotal);

        plan.put("stops", stops);
        plan.put("costSummary", Map.of(
            "transportation", transportTotal,
            "food", foodTotal,
            "entryFees", entryFeesTotal,
            "grandTotal", grandTotal,
            "savingsRemaining", remainingSavings
        ));
        plan.put("aiTip", "💡 Smart Explorer Tip: Travel on state transit buses and carry your student/senior citizen ID for maximum ticket discounts in " + queryCity + "!");

        return plan;
    }
}
