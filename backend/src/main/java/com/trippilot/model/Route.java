package com.trippilot.model;

import jakarta.persistence.*;

@Entity
@Table(name = "routes")
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String source;
    private String destination;
    private Double distanceKm;
    private Integer estimatedTimeMin;
    @Column(length = 2000)
    private String routePolyline;
    private String trafficCondition = "NORMAL"; // LOW, NORMAL, HEAVY

    public Route() {}

    public Route(String source, String destination, Double distanceKm, Integer estimatedTimeMin, String routePolyline) {
        this.source = source;
        this.destination = destination;
        this.distanceKm = distanceKm;
        this.estimatedTimeMin = estimatedTimeMin;
        this.routePolyline = routePolyline;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public Integer getEstimatedTimeMin() { return estimatedTimeMin; }
    public void setEstimatedTimeMin(Integer estimatedTimeMin) { this.estimatedTimeMin = estimatedTimeMin; }
    public String getRoutePolyline() { return routePolyline; }
    public void setRoutePolyline(String routePolyline) { this.routePolyline = routePolyline; }
    public String getTrafficCondition() { return trafficCondition; }
    public void setTrafficCondition(String trafficCondition) { this.trafficCondition = trafficCondition; }
}
