package com.trippilot.model;

import jakarta.persistence.*;

@Entity
@Table(name = "regional_foods")
public class RegionalFood {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String name;

    private String cuisine;
    private String priceRange;
    private Double typicalPrice;
    private Double hygieneRating;
    private String stallLocation;
    private String bestStallName;
    private Double latitude;
    private Double longitude;
    
    @Column(length = 1000)
    private String description;
    
    private Boolean isBudgetFriendly;
    private String imageUrl;

    public RegionalFood() {}

    public RegionalFood(String city, String name, String cuisine, String priceRange, Double typicalPrice,
                        Double hygieneRating, String stallLocation, String bestStallName, Double latitude,
                        Double longitude, String description, Boolean isBudgetFriendly, String imageUrl) {
        this.city = city;
        this.name = name;
        this.cuisine = cuisine;
        this.priceRange = priceRange;
        this.typicalPrice = typicalPrice;
        this.hygieneRating = hygieneRating;
        this.stallLocation = stallLocation;
        this.bestStallName = bestStallName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.description = description;
        this.isBudgetFriendly = isBudgetFriendly;
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public String getPriceRange() { return priceRange; }
    public void setPriceRange(String priceRange) { this.priceRange = priceRange; }

    public Double getTypicalPrice() { return typicalPrice; }
    public void setTypicalPrice(Double typicalPrice) { this.typicalPrice = typicalPrice; }

    public Double getHygieneRating() { return hygieneRating; }
    public void setHygieneRating(Double hygieneRating) { this.hygieneRating = hygieneRating; }

    public String getStallLocation() { return stallLocation; }
    public void setStallLocation(String stallLocation) { this.stallLocation = stallLocation; }

    public String getBestStallName() { return bestStallName; }
    public void setBestStallName(String bestStallName) { this.bestStallName = bestStallName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsBudgetFriendly() { return isBudgetFriendly; }
    public void setIsBudgetFriendly(Boolean isBudgetFriendly) { this.isBudgetFriendly = isBudgetFriendly; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
