package com.trippilot.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fare_reports")
public class FareReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String source;
    private String destination;
    private String transportationType;
    private Double quotedPrice;
    private Double estimatedMinPrice;
    private Double estimatedMaxPrice;
    private Double deviationPercentage;
    private String riskLevel; // LOW, MODERATE, HIGH, POTENTIALLY_UNFAIR
    private String confidenceLevel; // VERIFIED, ESTIMATED, USER_REPORTED, AI_SUGGESTION
    private Double confidenceScore; // e.g. 87.0
    private LocalDateTime timestamp = LocalDateTime.now();

    public FareReport() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getTransportationType() { return transportationType; }
    public void setTransportationType(String transportationType) { this.transportationType = transportationType; }
    public Double getQuotedPrice() { return quotedPrice; }
    public void setQuotedPrice(Double quotedPrice) { this.quotedPrice = quotedPrice; }
    public Double getEstimatedMinPrice() { return estimatedMinPrice; }
    public void setEstimatedMinPrice(Double estimatedMinPrice) { this.estimatedMinPrice = estimatedMinPrice; }
    public Double getEstimatedMaxPrice() { return estimatedMaxPrice; }
    public void setEstimatedMaxPrice(Double estimatedMaxPrice) { this.estimatedMaxPrice = estimatedMaxPrice; }
    public Double getDeviationPercentage() { return deviationPercentage; }
    public void setDeviationPercentage(Double deviationPercentage) { this.deviationPercentage = deviationPercentage; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public String getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(String confidenceLevel) { this.confidenceLevel = confidenceLevel; }
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
