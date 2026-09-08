package com.trippilot.model;

import jakarta.persistence.*;

@Entity
@Table(name = "transit_hubs")
public class TransitHub {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String name;

    private String hubType; // RAILWAY_STATION, BUS_TERMINUS, AIRPORT, METRO_HUB
    private Double latitude;
    private Double longitude;
    private String address;
    private String connectingRoutes;

    public TransitHub() {}

    public TransitHub(String city, String name, String hubType, Double latitude, Double longitude, String address, String connectingRoutes) {
        this.city = city;
        this.name = name;
        this.hubType = hubType;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.connectingRoutes = connectingRoutes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getHubType() { return hubType; }
    public void setHubType(String hubType) { this.hubType = hubType; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getConnectingRoutes() { return connectingRoutes; }
    public void setConnectingRoutes(String connectingRoutes) { this.connectingRoutes = connectingRoutes; }
}
