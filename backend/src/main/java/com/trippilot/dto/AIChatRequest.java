package com.trippilot.dto;

public class AIChatRequest {
    private String message;
    private String language = "en"; // en, te, hi
    private String currentLocation;
    private String destination;
    private Double budget;
    private String activeTransport;

    public AIChatRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
    public String getActiveTransport() { return activeTransport; }
    public void setActiveTransport(String activeTransport) { this.activeTransport = activeTransport; }
}
