package com.trippilot.dto;

import java.util.List;

public class FareCheckRequest {
    private String source;
    private String destination;
    private List<String> stops;
    private String transportationType; // AUTO, CAB, BUS, etc.
    private Double quotedFare;
    private String city = "Visakhapatnam";
    private Integer passengers = 1;
    private Double currentLatitude;
    private Double currentLongitude;

    public FareCheckRequest() {}

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public List<String> getStops() { return stops; }
    public void setStops(List<String> stops) { this.stops = stops; }
    public String getTransportationType() { return transportationType; }
    public void setTransportationType(String transportationType) { this.transportationType = transportationType; }
    public Double getQuotedFare() { return quotedFare; }
    public void setQuotedFare(Double quotedFare) { this.quotedFare = quotedFare; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public Integer getPassengers() { return passengers; }
    public void setPassengers(Integer passengers) { this.passengers = passengers; }
    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }
    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }
}