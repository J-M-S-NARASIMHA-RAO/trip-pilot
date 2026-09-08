package com.trippilot.model;

import jakarta.persistence.*;

@Entity
@Table(name = "fare_data")
public class FareData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String transportationType; // AUTO, BUS, CAB, SHARED_CAB, TRAIN
    private String city;               // Visakhapatnam, Srikakulam, Vijayawada, Hyderabad, Bengaluru
    private Double baseFare;           // Base flag drop fare (e.g. ₹20-30)
    private Double perKmRate;          // Rate per km after base distance (e.g. ₹12-15)
    private Double minimumFare;        // Minimum fare charged
    private Double waitingRatePerMin;  // Optional waiting charge
    private Double nightSurgeMultiplier = 1.0;
    private String effectiveDate;

    public FareData() {}

    public FareData(String transportationType, String city, Double baseFare, Double perKmRate, Double minimumFare, Double waitingRatePerMin, Double nightSurgeMultiplier, String effectiveDate) {
        this.transportationType = transportationType;
        this.city = city;
        this.baseFare = baseFare;
        this.perKmRate = perKmRate;
        this.minimumFare = minimumFare;
        this.waitingRatePerMin = waitingRatePerMin;
        this.nightSurgeMultiplier = nightSurgeMultiplier;
        this.effectiveDate = effectiveDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTransportationType() { return transportationType; }
    public void setTransportationType(String transportationType) { this.transportationType = transportationType; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public Double getBaseFare() { return baseFare; }
    public void setBaseFare(Double baseFare) { this.baseFare = baseFare; }
    public Double getPerKmRate() { return perKmRate; }
    public void setPerKmRate(Double perKmRate) { this.perKmRate = perKmRate; }
    public Double getMinimumFare() { return minimumFare; }
    public void setMinimumFare(Double minimumFare) { this.minimumFare = minimumFare; }
    public Double getWaitingRatePerMin() { return waitingRatePerMin; }
    public void setWaitingRatePerMin(Double waitingRatePerMin) { this.waitingRatePerMin = waitingRatePerMin; }
    public Double getNightSurgeMultiplier() { return nightSurgeMultiplier; }
    public void setNightSurgeMultiplier(Double nightSurgeMultiplier) { this.nightSurgeMultiplier = nightSurgeMultiplier; }
    public String getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(String effectiveDate) { this.effectiveDate = effectiveDate; }
}
