package com.trippilot.model;

import jakarta.persistence.*;

@Entity
@Table(name = "restaurants")
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String city;
    private String area;
    private String cuisine;
    private String priceCategory; // BUDGET_FRIENDLY, MODERATE, PREMIUM
    private Integer approxCostForTwo;
    private Double rating; // e.g. 4.8
    private Integer reviewCount; // e.g. 3420
    @Column(length = 1000)
    private String localTalk; // Word of mouth reputation
    private String famousDishes;
    private Integer distanceMeters;
    private String address;
    private String imageUrl;

    public Restaurant() {}

    public Restaurant(String name, String city, String area, String cuisine, String priceCategory, Integer approxCostForTwo, Double rating, Integer reviewCount, String localTalk, String famousDishes, Integer distanceMeters, String address, String imageUrl) {
        this.name = name;
        this.city = city;
        this.area = area;
        this.cuisine = cuisine;
        this.priceCategory = priceCategory;
        this.approxCostForTwo = approxCostForTwo;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.localTalk = localTalk;
        this.famousDishes = famousDishes;
        this.distanceMeters = distanceMeters;
        this.address = address;
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }
    public String getPriceCategory() { return priceCategory; }
    public void setPriceCategory(String priceCategory) { this.priceCategory = priceCategory; }
    public Integer getApproxCostForTwo() { return approxCostForTwo; }
    public void setApproxCostForTwo(Integer approxCostForTwo) { this.approxCostForTwo = approxCostForTwo; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public String getLocalTalk() { return localTalk; }
    public void setLocalTalk(String localTalk) { this.localTalk = localTalk; }
    public String getFamousDishes() { return famousDishes; }
    public void setFamousDishes(String famousDishes) { this.famousDishes = famousDishes; }
    public Integer getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(Integer distanceMeters) { this.distanceMeters = distanceMeters; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}