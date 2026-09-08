package com.trippilot.model;

import jakarta.persistence.*;

@Entity
@Table(name = "accommodations")
public class Accommodation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // DORMITORY, HOSTEL, BUDGET, HOTEL

    private Double pricePerNight;
    private Double rating;
    private Integer reviewCount;
    private String address;
    private Double latitude;
    private Double longitude;
    private String amenities;
    private String nearHub;
    private String bookingUrl;
    private String imageUrl;

    public Accommodation() {}

    public Accommodation(String city, String name, String type, Double pricePerNight, Double rating,
                         Integer reviewCount, String address, Double latitude, Double longitude,
                         String amenities, String nearHub, String bookingUrl, String imageUrl) {
        this.city = city;
        this.name = name;
        this.type = type;
        this.pricePerNight = pricePerNight;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.amenities = amenities;
        this.nearHub = nearHub;
        this.bookingUrl = bookingUrl;
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(Double pricePerNight) { this.pricePerNight = pricePerNight; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public String getNearHub() { return nearHub; }
    public void setNearHub(String nearHub) { this.nearHub = nearHub; }

    public String getBookingUrl() { return bookingUrl; }
    public void setBookingUrl(String bookingUrl) { this.bookingUrl = bookingUrl; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
