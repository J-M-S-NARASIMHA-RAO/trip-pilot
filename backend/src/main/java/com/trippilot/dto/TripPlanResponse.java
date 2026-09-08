package com.trippilot.dto;

import java.util.List;

public class TripPlanResponse {
    private String source;
    private String destination;
    private List<String> stops;
    private Double distanceKm;
    private Integer estimatedDistanceTime;
    private Integer travelers;
    private Double budget;
    private String userMode;
    private TransportOptionDTO recommendedOption;
    private List<TransportOptionDTO> allOptions;
    private String groupSavingsNotice;
    private String multiStopNotice;
    private String polyline;

    public TripPlanResponse() {}

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public List<String> getStops() { return stops; }
    public void setStops(List<String> stops) { this.stops = stops; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public Integer getEstimatedDistanceTime() { return estimatedDistanceTime; }
    public void setEstimatedDistanceTime(Integer estimatedDistanceTime) { this.estimatedDistanceTime = estimatedDistanceTime; }
    public Integer getTravelers() { return travelers; }
    public void setTravelers(Integer travelers) { this.travelers = travelers; }
    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
    public String getUserMode() { return userMode; }
    public void setUserMode(String userMode) { this.userMode = userMode; }
    public TransportOptionDTO getRecommendedOption() { return recommendedOption; }
    public void setRecommendedOption(TransportOptionDTO recommendedOption) { this.recommendedOption = recommendedOption; }
    public List<TransportOptionDTO> getAllOptions() { return allOptions; }
    public void setAllOptions(List<TransportOptionDTO> allOptions) { this.allOptions = allOptions; }
    public String getGroupSavingsNotice() { return groupSavingsNotice; }
    public void setGroupSavingsNotice(String groupSavingsNotice) { this.groupSavingsNotice = groupSavingsNotice; }
    public String getMultiStopNotice() { return multiStopNotice; }
    public void setMultiStopNotice(String multiStopNotice) { this.multiStopNotice = multiStopNotice; }
    public String getPolyline() { return polyline; }
    public void setPolyline(String polyline) { this.polyline = polyline; }
}