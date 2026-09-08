package com.trippilot.dto;

import java.util.List;
import java.util.Map;

public class FareCheckResponse {
    private String source;
    private String destination;
    private List<String> stops;
    private String transportationType;
    private Double quotedFare;
    private Double estimatedMinFare;
    private Double estimatedMaxFare;
    private Double priceDifference;
    private Double deviationPercentage;
    private String deviationLevel; // LOW, MODERATE, HIGH, POTENTIALLY_UNFAIR
    private String deviationHeadline;
    private String advisoryMessage;
    private Double confidenceScore;
    private String confidenceLabel; // VERIFIED, ESTIMATED, USER_REPORTED, AI_SUGGESTION
    private Double distanceKm;
    private Integer estimatedTimeMinutes;
    private Map<String, Double> costBreakdown;
    private List<TransportOptionDTO> alternatives;
    private List<String> possibleFactors;
    private String recommendedAction;
    private String multiStopNotice;

    public FareCheckResponse() {}

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
    public Double getEstimatedMinFare() { return estimatedMinFare; }
    public void setEstimatedMinFare(Double estimatedMinFare) { this.estimatedMinFare = estimatedMinFare; }
    public Double getEstimatedMaxFare() { return estimatedMaxFare; }
    public void setEstimatedMaxFare(Double estimatedMaxFare) { this.estimatedMaxFare = estimatedMaxFare; }
    public Double getPriceDifference() { return priceDifference; }
    public void setPriceDifference(Double priceDifference) { this.priceDifference = priceDifference; }
    public Double getDeviationPercentage() { return deviationPercentage; }
    public void setDeviationPercentage(Double deviationPercentage) { this.deviationPercentage = deviationPercentage; }
    public String getDeviationLevel() { return deviationLevel; }
    public void setDeviationLevel(String deviationLevel) { this.deviationLevel = deviationLevel; }
    public String getDeviationHeadline() { return deviationHeadline; }
    public void setDeviationHeadline(String deviationHeadline) { this.deviationHeadline = deviationHeadline; }
    public String getAdvisoryMessage() { return advisoryMessage; }
    public void setAdvisoryMessage(String advisoryMessage) { this.advisoryMessage = advisoryMessage; }
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
    public String getConfidenceLabel() { return confidenceLabel; }
    public void setConfidenceLabel(String confidenceLabel) { this.confidenceLabel = confidenceLabel; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public Integer getEstimatedTimeMinutes() { return estimatedTimeMinutes; }
    public void setEstimatedTimeMinutes(Integer estimatedTimeMinutes) { this.estimatedTimeMinutes = estimatedTimeMinutes; }
    public Map<String, Double> getCostBreakdown() { return costBreakdown; }
    public void setCostBreakdown(Map<String, Double> costBreakdown) { this.costBreakdown = costBreakdown; }
    public List<TransportOptionDTO> getAlternatives() { return alternatives; }
    public void setAlternatives(List<TransportOptionDTO> alternatives) { this.alternatives = alternatives; }
    public List<String> getPossibleFactors() { return possibleFactors; }
    public void setPossibleFactors(List<String> possibleFactors) { this.possibleFactors = possibleFactors; }
    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }
    public String getMultiStopNotice() { return multiStopNotice; }
    public void setMultiStopNotice(String multiStopNotice) { this.multiStopNotice = multiStopNotice; }
}