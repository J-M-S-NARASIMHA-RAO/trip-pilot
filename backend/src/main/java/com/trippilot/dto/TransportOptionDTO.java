package com.trippilot.dto;

import java.util.Map;

public class TransportOptionDTO {
    private String type; // BUS, AUTO, CAB, SHARED_CAB, TRAIN, WALK
    private String title;
    private String provider;
    private Double estimatedFareMin;
    private Double estimatedFareMax;
    private Double totalCost;
    private Double costPerPerson;
    private Integer durationMinutes;
    private String convenience; // LOW, MEDIUM, HIGH, VERY_HIGH
    private String badge; // CHEAPEST, BEST_OVERALL, FASTEST, SAFEST, VALUE
    private Double score; // 0-100 recommendation score
    private String whyChosen; // explainability
    private Map<String, Double> costBreakdown;
    private String statusRisk; // TRANSPARENT, LOW_RISK, MODERATE_RISK
    private String stepsSummary;

    public TransportOptionDTO() {}

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public Double getEstimatedFareMin() { return estimatedFareMin; }
    public void setEstimatedFareMin(Double estimatedFareMin) { this.estimatedFareMin = estimatedFareMin; }
    public Double getEstimatedFareMax() { return estimatedFareMax; }
    public void setEstimatedFareMax(Double estimatedFareMax) { this.estimatedFareMax = estimatedFareMax; }
    public Double getTotalCost() { return totalCost; }
    public void setTotalCost(Double totalCost) { this.totalCost = totalCost; }
    public Double getCostPerPerson() { return costPerPerson; }
    public void setCostPerPerson(Double costPerPerson) { this.costPerPerson = costPerPerson; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getConvenience() { return convenience; }
    public void setConvenience(String convenience) { this.convenience = convenience; }
    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    public String getWhyChosen() { return whyChosen; }
    public void setWhyChosen(String whyChosen) { this.whyChosen = whyChosen; }
    public Map<String, Double> getCostBreakdown() { return costBreakdown; }
    public void setCostBreakdown(Map<String, Double> costBreakdown) { this.costBreakdown = costBreakdown; }
    public String getStatusRisk() { return statusRisk; }
    public void setStatusRisk(String statusRisk) { this.statusRisk = statusRisk; }
    public String getStepsSummary() { return stepsSummary; }
    public void setStepsSummary(String stepsSummary) { this.stepsSummary = stepsSummary; }
}
