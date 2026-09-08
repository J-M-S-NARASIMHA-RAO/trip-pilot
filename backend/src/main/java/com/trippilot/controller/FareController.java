package com.trippilot.controller;

import com.trippilot.dto.FareCheckRequest;
import com.trippilot.dto.FareCheckResponse;
import com.trippilot.dto.TransportOptionDTO;
import com.trippilot.model.FareReport;
import com.trippilot.repository.FareReportRepository;
import com.trippilot.service.AntiDeceptionEngine;
import com.trippilot.service.FareEngineService;
import com.trippilot.service.SmartRecommendationEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fare")
@CrossOrigin(origins = "*")
public class FareController {

    private final FareEngineService fareEngineService;
    private final AntiDeceptionEngine antiDeceptionEngine;
    private final SmartRecommendationEngine smartRecommendationEngine;
    private final FareReportRepository fareReportRepository;
    private final com.trippilot.service.LivePricingEngine livePricingEngine;

    public FareController(FareEngineService fareEngineService,
                          AntiDeceptionEngine antiDeceptionEngine,
                          SmartRecommendationEngine smartRecommendationEngine,
                          FareReportRepository fareReportRepository,
                          com.trippilot.service.LivePricingEngine livePricingEngine) {
        this.fareEngineService = fareEngineService;
        this.antiDeceptionEngine = antiDeceptionEngine;
        this.smartRecommendationEngine = smartRecommendationEngine;
        this.fareReportRepository = fareReportRepository;
        this.livePricingEngine = livePricingEngine;
    }

    @PostMapping("/check")
    public ResponseEntity<FareCheckResponse> checkFare(@RequestBody FareCheckRequest request) {
        String src = request.getSource() != null ? request.getSource() : "Visakhapatnam Railway Station";
        String dest = request.getDestination() != null ? request.getDestination() : "Vizag Complex";
        String type = request.getTransportationType() != null ? request.getTransportationType().toUpperCase() : "AUTO";
        double quoted = request.getQuotedFare() != null ? request.getQuotedFare() : 100.0;
        int pax = request.getPassengers() != null ? request.getPassengers() : 1;
        String city = request.getCity() != null ? request.getCity() : "Visakhapatnam";

        // Base distance lookup
        double distanceKm = 2.8;
        String lowerDest = dest.toLowerCase();
        if (lowerDest.contains("beach") || lowerDest.contains("rk")) {
            distanceKm = 5.2;
        } else if (lowerDest.contains("kailasagiri")) {
            distanceKm = 11.5;
        } else if (lowerDest.contains("rushikonda")) {
            distanceKm = 17.0;
        } else if (lowerDest.contains("submarine")) {
            distanceKm = 5.5;
        } else if (lowerDest.contains("sairam") || lowerDest.contains("diamond park")) {
            distanceKm = 2.2;
        } else if (lowerDest.contains("complex") || lowerDest.contains("dwaraka")) {
            distanceKm = 2.8;
        }

        // Multi-stop addition
        String multiStopNotice = null;
        if (request.getStops() != null && !request.getStops().isEmpty()) {
            double extraKm = request.getStops().size() * 2.5; // average intermediate hop
            distanceKm += extraKm;
            multiStopNotice = "📍 Multi-Stop Route: " + src + " ➔ " + String.join(" ➔ ", request.getStops()) + " ➔ " + dest + " (Combined multi-stop ride)";
        }

        double[] range = fareEngineService.calculateFairRange(type, city, distanceKm, pax);
        AntiDeceptionEngine.AnalysisResult analysis = antiDeceptionEngine.analyzeFare(quoted, range[0], range[1], distanceKm, type);

        FareCheckResponse resp = new FareCheckResponse();
        resp.setSource(src);
        resp.setDestination(dest);
        resp.setStops(request.getStops());
        resp.setTransportationType(type);
        resp.setQuotedFare(quoted);
        resp.setEstimatedMinFare(range[0]);
        resp.setEstimatedMaxFare(range[1]);
        resp.setPriceDifference(analysis.priceDifference);
        resp.setDeviationPercentage(analysis.deviationPercentage);
        resp.setDeviationLevel(analysis.deviationLevel);
        resp.setDeviationHeadline(analysis.headline);
        resp.setAdvisoryMessage(analysis.advisoryMessage);
        resp.setPossibleFactors(analysis.possibleFactors);
        resp.setRecommendedAction(analysis.recommendedAction);
        resp.setConfidenceScore(analysis.confidenceScore);
        resp.setConfidenceLabel(analysis.confidenceLabel);
        resp.setDistanceKm(Math.round(distanceKm * 10.0) / 10.0);
        resp.setEstimatedTimeMinutes((int) Math.round(distanceKm * 2.8) + 4);
        resp.setCostBreakdown(fareEngineService.getBreakdown(type, distanceKm, (range[0] + range[1]) / 2.0));
        resp.setMultiStopNotice(multiStopNotice);

        // Alternatives
        List<TransportOptionDTO> allOpts = smartRecommendationEngine.evaluateOptions(src, dest, distanceKm, pax, null, "TOURIST", city);
        resp.setAlternatives(allOpts);

        // Record fare report
        FareReport report = new FareReport();
        report.setSource(src);
        report.setDestination(dest);
        report.setTransportationType(type);
        report.setQuotedPrice(quoted);
        report.setEstimatedMinPrice(range[0]);
        report.setEstimatedMaxPrice(range[1]);
        report.setDeviationPercentage(analysis.deviationPercentage);
        report.setRiskLevel(analysis.deviationLevel);
        report.setConfidenceScore(analysis.confidenceScore);
        report.setConfidenceLevel(analysis.confidenceLabel);
        fareReportRepository.save(report);

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/analyze")
    public ResponseEntity<FareCheckResponse> analyzeFare(@RequestBody FareCheckRequest request) {
        return checkFare(request);
    }

    @GetMapping("/live-rates")
    public ResponseEntity<List<com.trippilot.service.LivePricingEngine.LiveRideQuote>> getLiveRates(
            @RequestParam(defaultValue = "3.0") double distanceKm,
            @RequestParam(defaultValue = "Visakhapatnam") String city,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String destination) {
        return ResponseEntity.ok(livePricingEngine.getLiveRates(distanceKm, city, source, destination));
    }
}