package com.trippilot.service;

import com.trippilot.model.TariffRule;
import com.trippilot.repository.TariffRuleRepository;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalTime;
import java.util.*;

@Service
public class ProviderComparisonService {

    private final TariffRuleRepository tariffRuleRepository;
    private final DistanceCalculationService distanceService;

    public ProviderComparisonService(TariffRuleRepository tariffRuleRepository,
                                     DistanceCalculationService distanceService) {
        this.tariffRuleRepository = tariffRuleRepository;
        this.distanceService = distanceService;
    }

    public static class ProviderOption {
        private String id;
        private String provider;
        private String serviceName;
        private String category;
        private double fareMin;
        private double fareMax;
        private String fareFormatted;
        private int etaMinutes;
        private String etaFormatted;
        private String provenanceBadge;
        private String badgeLabel;
        private String badgeColor;
        private String deepLink;
        private String bookingAction;
        private String advisory;
        private boolean recommended;

        public ProviderOption() {}

        public ProviderOption(String id, String provider, String serviceName, String category,
                              double fareMin, double fareMax, int etaMinutes,
                              String provenanceBadge, String badgeLabel, String badgeColor,
                              String deepLink, String bookingAction, String advisory, boolean recommended) {
            this.id = id;
            this.provider = provider;
            this.serviceName = serviceName;
            this.category = category;
            this.fareMin = Math.round(fareMin);
            this.fareMax = Math.round(fareMax);
            if (this.fareMin == this.fareMax) {
                this.fareFormatted = "₹" + (int) this.fareMin;
            } else {
                this.fareFormatted = "₹" + (int) this.fareMin + " - ₹" + (int) this.fareMax;
            }
            this.etaMinutes = etaMinutes;
            this.etaFormatted = etaMinutes + " min" + (etaMinutes > 1 ? "s" : "");
            this.provenanceBadge = provenanceBadge;
            this.badgeLabel = badgeLabel;
            this.badgeColor = badgeColor;
            this.deepLink = deepLink;
            this.bookingAction = bookingAction;
            this.advisory = advisory;
            this.recommended = recommended;
        }

        public String getId() { return id; }
        public String getProvider() { return provider; }
        public String getServiceName() { return serviceName; }
        public String getCategory() { return category; }
        public double getFareMin() { return fareMin; }
        public double getFareMax() { return fareMax; }
        public String getFareFormatted() { return fareFormatted; }
        public int getEtaMinutes() { return etaMinutes; }
        public String getEtaFormatted() { return etaFormatted; }
        public String getProvenanceBadge() { return provenanceBadge; }
        public String getBadgeLabel() { return badgeLabel; }
        public String getBadgeColor() { return badgeColor; }
        public String getDeepLink() { return deepLink; }
        public String getBookingAction() { return bookingAction; }
        public String getAdvisory() { return advisory; }
        public boolean isRecommended() { return recommended; }
    }

    public static class ComparisonResult {
        private String city;
        private String origin;
        private String destination;
        private double distanceKm;
        private boolean nightTariffActive;
        private int currentHour;
        private List<ProviderOption> options;

        public ComparisonResult() {}

        public ComparisonResult(String city, String origin, String destination, double distanceKm,
                                boolean nightTariffActive, int currentHour, List<ProviderOption> options) {
            this.city = city;
            this.origin = origin;
            this.destination = destination;
            this.distanceKm = distanceKm;
            this.nightTariffActive = nightTariffActive;
            this.currentHour = currentHour;
            this.options = options;
        }

        public String getCity() { return city; }
        public String getOrigin() { return origin; }
        public String getDestination() { return destination; }
        public double getDistanceKm() { return distanceKm; }
        public boolean isNightTariffActive() { return nightTariffActive; }
        public int getCurrentHour() { return currentHour; }
        public List<ProviderOption> getOptions() { return options; }
    }

    public ComparisonResult compareProviders(String city, String origin, String destination,
                                             double distanceKm, Double pickupLat, Double pickupLon,
                                             Double dropLat, Double dropLon) {
        String activeCity = (city != null && !city.isBlank()) ? city : "Visakhapatnam";
        double dist = Math.max(0.5, distanceKm);
        int hour = LocalTime.now().getHour();
        boolean isNight = (hour >= 23 || hour < 5);

        // Fetch official tariff rule for auto in this city
        Optional<TariffRule> autoRuleOpt = tariffRuleRepository.findByCityIgnoreCaseAndVehicleTypeIgnoreCase(activeCity, "AUTO");
        TariffRule autoRule = autoRuleOpt.orElse(getDefaultTariff(activeCity, "AUTO"));

        // Pre-fill links for Uber, Rapido, Ola
        String encOrigin = encodeParam(origin != null && !origin.isBlank() ? origin : "Current Location");
        String encDest = encodeParam(destination != null && !destination.isBlank() ? destination : "");

        String uberLink = "https://m.uber.com/ul/?action=setPickup&client_id=trippilot"
                + "&pickup[formatted_address]=" + encOrigin
                + "&pickup[nickname]=" + encOrigin
                + (encDest.isEmpty() ? "" : ("&dropoff[formatted_address]=" + encDest + "&dropoff[nickname]=" + encDest));

        String rapidoLink = "https://m.rapido.bike/?pickup_address=" + encOrigin
                + (encDest.isEmpty() ? "" : ("&drop_address=" + encDest + "&destination=" + encDest + "&drop=" + encDest + "&dest=" + encDest));

        String olaLink = "https://book.olacabs.com/?pickup_name=" + encOrigin
                + (encDest.isEmpty() ? "" : ("&drop_name=" + encDest));

        // Multi-modal ETAs
        Map<String, Integer> etas = distanceService.getMultiModalEtas(dist);

        List<ProviderOption> options = new ArrayList<>();

        // 1. RTO Government Meter Auto (Tariff Verified)
        double billableKm = Math.max(0.0, dist - autoRule.getBaseDistanceKm());
        double baseAutoCost = autoRule.getBaseFare() + (billableKm * autoRule.getPerKmRate());
        double nightMultiplier = isNight ? autoRule.getNightSurchargeMultiplier() : 1.0;
        double govtAutoMin = Math.max(autoRule.getMinimumFare(), baseAutoCost * nightMultiplier);
        double govtAutoMax = Math.ceil(govtAutoMin * 1.10);

        String autoAdvisory = isNight
                ? "Official Night Tariff active (1.5x, 11PM-5AM). Refuse demands above ₹" + (int) govtAutoMax + "."
                : "Municipal statutory rate. Insist driver resets digital meter before moving.";

        options.add(new ProviderOption(
                "govt-auto", "Government Meter", "Statutory RTO Auto", "AUTO",
                govtAutoMin, govtAutoMax, etas.get("AUTO"),
                "TARIFF_VERIFIED", "Tariff Verified", "emerald",
                null, "INSIST_ON_METER", autoAdvisory, true
        ));

        // 2. Rapido Bike Taxi
        double rapidoBikeRaw = 20.0 + (Math.max(0, dist - 1.0) * 6.5) + (dist * 1.8);
        double rapidoBikeMin = Math.max(25.0, rapidoBikeRaw);
        double rapidoBikeMax = Math.ceil(rapidoBikeMin * 1.15);
        options.add(new ProviderOption(
                "rapido-bike", "Rapido", "Rapido Bike Taxi", "BIKE_TAXI",
                rapidoBikeMin, rapidoBikeMax, etas.get("BIKE"),
                "APP_ESTIMATE", "App Estimate", "indigo",
                rapidoLink, "OPEN_APP", "Fastest through traffic. Helmets mandatory.", false
        ));

        // 3. Rapido Auto
        double rapidoAutoRaw = 25.0 + (Math.max(0, dist - 1.5) * 12.5);
        double rapidoAutoMin = Math.max(30.0, rapidoAutoRaw);
        double rapidoAutoMax = Math.ceil(rapidoAutoMin * 1.18);
        options.add(new ProviderOption(
                "rapido-auto", "Rapido", "Rapido Auto", "AUTO",
                rapidoAutoMin, rapidoAutoMax, etas.get("AUTO"),
                "APP_ESTIMATE", "App Estimate", "indigo",
                rapidoLink, "OPEN_APP", "Guaranteed doorstep pickup; no haggling.", false
        ));

        // 4. Uber Moto
        double uberMotoRaw = 24.0 + (Math.max(0, dist - 1.0) * 7.0) + (dist * 1.5);
        double uberMotoMin = Math.max(28.0, uberMotoRaw);
        double uberMotoMax = Math.ceil(uberMotoMin * 1.16);
        options.add(new ProviderOption(
                "uber-moto", "Uber", "Uber Moto", "BIKE_TAXI",
                uberMotoMin, uberMotoMax, etas.get("BIKE") + 1,
                "APP_ESTIMATE", "App Estimate", "indigo",
                uberLink, "OPEN_APP", "In-app OTP tracking and live GPS share.", false
        ));

        // 5. Uber Auto
        double uberAutoRaw = 28.0 + (Math.max(0, dist - 1.5) * 13.0);
        double uberAutoMin = Math.max(35.0, uberAutoRaw);
        double uberAutoMax = Math.ceil(uberAutoMin * 1.20);
        options.add(new ProviderOption(
                "uber-auto", "Uber", "Uber Auto", "AUTO",
                uberAutoMin, uberAutoMax, etas.get("AUTO") + 1,
                "APP_ESTIMATE", "App Estimate", "indigo",
                uberLink, "OPEN_APP", "Convenient digital cashless payment via UPI.", false
        ));

        // 6. Uber Go / Cab
        double uberGoRaw = 65.0 + (Math.max(0, dist - 2.0) * 16.5) + (dist * 2.0);
        double uberGoMin = Math.max(80.0, uberGoRaw);
        double uberGoMax = Math.ceil(uberGoMin * 1.25);
        options.add(new ProviderOption(
                "uber-go", "Uber", "Uber Go (AC Sedan)", "CAB",
                uberGoMin, uberGoMax, etas.get("CAB"),
                "APP_ESTIMATE", "App Estimate", "indigo",
                uberLink, "OPEN_APP", "Air-conditioned comfort, ideal for groups & luggage.", false
        ));

        // 7. Ola Auto
        double olaAutoRaw = 26.0 + (Math.max(0, dist - 1.5) * 12.8);
        double olaAutoMin = Math.max(32.0, olaAutoRaw);
        double olaAutoMax = Math.ceil(olaAutoMin * 1.18);
        options.add(new ProviderOption(
                "ola-auto", "Ola", "Ola Auto", "AUTO",
                olaAutoMin, olaAutoMax, etas.get("AUTO") + 2,
                "APP_ESTIMATE", "App Estimate", "indigo",
                olaLink, "OPEN_APP", "Standard app auto booking with SOS safety button.", false
        ));

        // 8. Public Transit City Bus
        double busFareMin = Math.max(10.0, Math.floor(dist / 3.0) * 5.0 + 10.0);
        double busFareMax = busFareMin + 5.0;
        options.add(new ProviderOption(
                "city-bus", "City RTC", "Municipal City Bus", "BUS",
                busFareMin, busFareMax, etas.get("BUS"),
                "PUBLIC_TRANSIT", "Public Transit", "cyan",
                null, "BOARD_BUS", "Most budget-friendly choice. Show conductor exact change.", false
        ));

        // 9. Walking (if <= 5km)
        if (dist <= 5.0) {
            int kcal = (int) (dist * 55);
            options.add(new ProviderOption(
                "walking", "Footpath", "Walking Route", "WALK",
                0.0, 0.0, etas.get("WALK"),
                "ZERO_EMISSION", "Zero Emission", "gray",
                null, "WALK_ROUTE", "Healthy & free! Burns approx " + kcal + " kcal.", false
            ));
        }

        return new ComparisonResult(activeCity, origin, destination, dist, isNight, hour, options);
    }

    private TariffRule getDefaultTariff(String city, String type) {
        TariffRule r = new TariffRule();
        r.setCity(city);
        r.setVehicleType(type);
        r.setBaseFare(20.0);
        r.setBaseDistanceKm(1.5);
        r.setPerKmRate(12.0);
        r.setNightSurchargeMultiplier(1.5);
        r.setMinimumFare(20.0);
        r.setWaitingChargePerMinute(1.0);
        return r;
    }

    private String encodeParam(String val) {
        try {
            return URLEncoder.encode(val, StandardCharsets.UTF_8.toString());
        } catch (Exception e) {
            return val;
        }
    }
}
