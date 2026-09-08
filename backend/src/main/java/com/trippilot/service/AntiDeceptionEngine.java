package com.trippilot.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class AntiDeceptionEngine {

    public static class AnalysisResult {
        public double deviationPercentage;
        public double priceDifference;
        public String deviationLevel; // LOW, MODERATE, HIGH, POTENTIALLY_UNFAIR
        public String headline;
        public String advisoryMessage;
        public List<String> possibleFactors;
        public String recommendedAction;
        public double confidenceScore;
        public String confidenceLabel; // VERIFIED, ESTIMATED, USER_REPORTED, AI_SUGGESTION
    }

    public AnalysisResult analyzeFare(double quotedFare, double minFair, double maxFair, double distanceKm, String transportType) {
        AnalysisResult result = new AnalysisResult();
        double midFair = (minFair + maxFair) / 2.0;

        if (quotedFare <= 0) {
            result.deviationPercentage = 0.0;
            result.priceDifference = 0.0;
            result.deviationLevel = "LOW";
            result.headline = "Fare Information Required";
            result.advisoryMessage = "Please provide a valid quoted fare to analyze.";
            result.recommendedAction = "Enter the fare quoted by your driver or transport provider.";
            result.confidenceScore = 90.0;
            result.confidenceLabel = "ESTIMATED";
            result.possibleFactors = List.of("Awaiting valid driver quote");
            return result;
        }

        double diff;
        double deviation;

        if (quotedFare <= maxFair) {
            diff = 0.0;
            deviation = 0.0;
            result.deviationLevel = "LOW";
            result.headline = "🟢 Fair Price Detected";
            result.advisoryMessage = "The quoted fare is well within the estimated fair range for this route and distance.";
            result.recommendedAction = "You are receiving a reasonable rate. Safe travels!";
        } else {
            diff = quotedFare - maxFair;
            deviation = Math.round(((quotedFare - maxFair) / maxFair) * 100.0);
            result.priceDifference = Math.round(diff * 100.0) / 100.0;
            result.deviationPercentage = deviation;

            if (deviation <= 20.0) {
                result.deviationLevel = "LOW";
                result.headline = "🟢 Minor Price Variation";
                result.advisoryMessage = "The quoted fare is slightly above the estimated baseline, but accounts for standard local adjustments.";
                result.recommendedAction = "Acceptable price. You may ask if luggage or quick drop is included.";
            } else if (deviation <= 45.0) {
                result.deviationLevel = "MODERATE";
                result.headline = "🟡 Moderate Price Deviation";
                result.advisoryMessage = "The quoted fare is moderately higher than standard local fares for this route. Driver may be considering return empty-trip or mild traffic.";
                result.recommendedAction = "Consider negotiating down to ₹" + Math.round(maxFair) + " or checking standard bus/cab alternatives.";
            } else {
                result.deviationLevel = "HIGH";
                result.headline = "🔴 High Price Deviation";
                result.advisoryMessage = "The quoted fare is significantly higher than the estimated fair fare range for this route. Consider negotiating or comparing other transportation options.";
                result.recommendedAction = "Politely request the standard fare (around ₹" + Math.round(minFair) + "–₹" + Math.round(maxFair) + ") or use the alternatives listed below.";
            }
        }

        // Possible ethical non-accusatory factors
        List<String> factors = new ArrayList<>();
        if (deviation > 20) {
            factors.add("Higher demand or surge pricing during rush hour");
            factors.add("Return empty-trip compensation for outer/remote destinations");
            factors.add("Luggage or multiple passenger surcharge");
            factors.add("Lack of digital fare meter calibration");
            factors.add("Potential overpricing for unfamiliar passengers");
        } else {
            factors.add("Standard regional regulated tariff");
            factors.add("Fair meter / local union fare alignment");
        }
        result.possibleFactors = factors;

        // Confidence calculation based on distance and route data
        if (distanceKm > 0 && distanceKm < 30) {
            result.confidenceScore = 87.0;
            result.confidenceLabel = "VERIFIED";
        } else if (distanceKm >= 30) {
            result.confidenceScore = 74.0;
            result.confidenceLabel = "ESTIMATED";
        } else {
            result.confidenceScore = 65.0;
            result.confidenceLabel = "USER_REPORTED";
        }

        return result;
    }
}
