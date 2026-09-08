package com.trippilot.dto;

import java.util.List;

public class TripPlanRequest {
    private String source;
    private String destination;
    private List<String> stops; // Intermediate multi-stops like Rapido
    private Integer travelers = 1;
    private Double budget;
    private Integer maxTravelTimeMin;
    private String preferredTransport = "ANY";
    private String userMode = "TOURIST"; // STUDENT, TOURIST, BUSINESS, FAMILY
    private Double currentLat;
    private Double currentLng;

    public TripPlanRequest() {}

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public List<String> getStops() { return stops; }
    public void setStops(List<String> stops) { this.stops = stops; }
    public Integer getTravelers() { return travelers; }
    public void setTravelers(Integer travelers) { this.travelers = travelers; }
    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
    public Integer getMaxTravelTimeMin() { return maxTravelTimeMin; }
    public void setMaxTravelTimeMin(Integer maxTravelTimeMin) { this.maxTravelTimeMin = maxTravelTimeMin; }
    public String getPreferredTransport() { return preferredTransport; }
    public void setPreferredTransport(String preferredTransport) { this.preferredTransport = preferredTransport; }
    public String getUserMode() { return userMode; }
    public void setUserMode(String userMode) { this.userMode = userMode; }
    public Double getCurrentLat() { return currentLat; }
    public void setCurrentLat(Double currentLat) { this.currentLat = currentLat; }
    public Double getCurrentLng() { return currentLng; }
    public void setCurrentLng(Double currentLng) { this.currentLng = currentLng; }
}