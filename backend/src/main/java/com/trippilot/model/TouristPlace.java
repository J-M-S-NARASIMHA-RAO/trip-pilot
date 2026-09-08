package com.trippilot.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tourist_places")
public class TouristPlace {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String city;
    @Column(length = 1000)
    private String description;
    @Column(length = 1000)
    private String history;
    private Double entryFee;
    private Integer estimatedVisitTimeMin;
    private Double latitude;
    private Double longitude;
    private String category; // BEACH, MUSEUM, TEMPLE, NATURE, HERITAGE, SHOPPING
    private String imageUrl;
    private String famousFor;
    private String bestTime;

    public TouristPlace() {}

    public TouristPlace(String name, String city, String description, String history, Double entryFee, Integer estimatedVisitTimeMin, Double latitude, Double longitude, String category, String imageUrl, String famousFor, String bestTime) {
        this.name = name;
        this.city = city;
        this.description = description;
        this.history = history;
        this.entryFee = entryFee;
        this.estimatedVisitTimeMin = estimatedVisitTimeMin;
        this.latitude = latitude;
        this.longitude = longitude;
        this.category = category;
        this.imageUrl = imageUrl;
        this.famousFor = famousFor;
        this.bestTime = bestTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getHistory() { return history; }
    public void setHistory(String history) { this.history = history; }
    public Double getEntryFee() { return entryFee; }
    public void setEntryFee(Double entryFee) { this.entryFee = entryFee; }
    public Integer getEstimatedVisitTimeMin() { return estimatedVisitTimeMin; }
    public void setEstimatedVisitTimeMin(Integer estimatedVisitTimeMin) { this.estimatedVisitTimeMin = estimatedVisitTimeMin; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getFamousFor() { return famousFor; }
    public void setFamousFor(String famousFor) { this.famousFor = famousFor; }
    public String getBestTime() { return bestTime; }
    public void setBestTime(String bestTime) { this.bestTime = bestTime; }
}
