package com.trippilot.model;

import jakarta.persistence.*;

@Entity
@Table(name = "transportation")
public class Transportation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // BUS, AUTO, CAB, SHARED_CAB, TRAIN, WALK
    private String provider;
    private Integer capacity;
    private Double reliabilityScore; // 0.0 to 1.0
    private Double safetyScore;      // 0.0 to 1.0
    private Double convenienceScore; // 0.0 to 1.0

    public Transportation() {}

    public Transportation(String type, String provider, Integer capacity, Double reliabilityScore, Double safetyScore, Double convenienceScore) {
        this.type = type;
        this.provider = provider;
        this.capacity = capacity;
        this.reliabilityScore = reliabilityScore;
        this.safetyScore = safetyScore;
        this.convenienceScore = convenienceScore;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Double getReliabilityScore() { return reliabilityScore; }
    public void setReliabilityScore(Double reliabilityScore) { this.reliabilityScore = reliabilityScore; }
    public Double getSafetyScore() { return safetyScore; }
    public void setSafetyScore(Double safetyScore) { this.safetyScore = safetyScore; }
    public Double getConvenienceScore() { return convenienceScore; }
    public void setConvenienceScore(Double convenienceScore) { this.convenienceScore = convenienceScore; }
}
