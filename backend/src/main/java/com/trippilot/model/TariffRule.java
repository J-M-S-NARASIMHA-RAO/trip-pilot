package com.trippilot.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tariff_rules")
public class TariffRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String vehicleType; // AUTO, BIKE_TAXI, CAB, BUS, SHARED_VAN

    private Double baseFare;
    private Double baseKm;
    private Double perKmRate;
    private Double nightSurchargePercentage; // e.g. 50.0% for 1.5x, 25.0% for 1.25x
    private Integer nightStartHour; // e.g. 23 (11 PM)
    private Integer nightEndHour;   // e.g. 5 (5 AM)
    private Double waitingChargePerMinute;
    private Double luggageCharge;
    private String gazetteNotificationRef;

    public TariffRule() {}

    public TariffRule(String city, String vehicleType, Double baseFare, Double baseKm, Double perKmRate,
                      Double nightSurchargePercentage, Integer nightStartHour, Integer nightEndHour,
                      Double waitingChargePerMinute, Double luggageCharge, String gazetteNotificationRef) {
        this.city = city;
        this.vehicleType = vehicleType;
        this.baseFare = baseFare;
        this.baseKm = baseKm;
        this.perKmRate = perKmRate;
        this.nightSurchargePercentage = nightSurchargePercentage;
        this.nightStartHour = nightStartHour;
        this.nightEndHour = nightEndHour;
        this.waitingChargePerMinute = waitingChargePerMinute;
        this.luggageCharge = luggageCharge;
        this.gazetteNotificationRef = gazetteNotificationRef;
    }

    public TariffRule(String city, String vehicleType, Double baseFare, Double baseKm, Double perKmRate,
                      Double nightSurchargePercentage, Double waitingChargePerMinute, String gazetteNotificationRef) {
        this(city, vehicleType, baseFare, baseKm, perKmRate, nightSurchargePercentage, 23, 5, waitingChargePerMinute, 0.0, gazetteNotificationRef);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public Double getBaseFare() { return baseFare; }
    public void setBaseFare(Double baseFare) { this.baseFare = baseFare; }

    public Double getBaseKm() { return baseKm; }
    public void setBaseKm(Double baseKm) { this.baseKm = baseKm; }

    public Double getBaseDistanceKm() { return baseKm != null ? baseKm : 1.5; }
    public void setBaseDistanceKm(Double baseKm) { this.baseKm = baseKm; }

    public Double getPerKmRate() { return perKmRate; }
    public void setPerKmRate(Double perKmRate) { this.perKmRate = perKmRate; }

    public Double getNightSurchargePercentage() { return nightSurchargePercentage; }
    public void setNightSurchargePercentage(Double nightSurchargePercentage) { this.nightSurchargePercentage = nightSurchargePercentage; }

    public Double getNightSurchargeMultiplier() {
        return 1.0 + (nightSurchargePercentage != null ? nightSurchargePercentage / 100.0 : 0.25);
    }
    public void setNightSurchargeMultiplier(Double multiplier) {
        this.nightSurchargePercentage = (multiplier != null && multiplier > 1.0) ? (multiplier - 1.0) * 100.0 : 0.0;
    }

    public Double getMinimumFare() { return baseFare != null ? baseFare : 20.0; }
    public void setMinimumFare(Double minFare) { this.baseFare = minFare; }

    public Integer getNightStartHour() { return nightStartHour; }
    public void setNightStartHour(Integer nightStartHour) { this.nightStartHour = nightStartHour; }

    public Integer getNightEndHour() { return nightEndHour; }
    public void setNightEndHour(Integer nightEndHour) { this.nightEndHour = nightEndHour; }

    public Double getWaitingChargePerMinute() { return waitingChargePerMinute; }
    public void setWaitingChargePerMinute(Double waitingChargePerMinute) { this.waitingChargePerMinute = waitingChargePerMinute; }

    public Double getLuggageCharge() { return luggageCharge; }
    public void setLuggageCharge(Double luggageCharge) { this.luggageCharge = luggageCharge; }

    public String getGazetteNotificationRef() { return gazetteNotificationRef; }
    public void setGazetteNotificationRef(String gazetteNotificationRef) { this.gazetteNotificationRef = gazetteNotificationRef; }
}
