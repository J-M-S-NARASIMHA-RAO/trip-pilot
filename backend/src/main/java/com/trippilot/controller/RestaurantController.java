package com.trippilot.controller;

import com.trippilot.model.Restaurant;
import com.trippilot.repository.RestaurantRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {

    private final RestaurantRepository restaurantRepository;

    public RestaurantController(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Restaurant>> getNearbyRestaurants(
            @RequestParam(defaultValue = "Visakhapatnam") String city,
            @RequestParam(required = false) String priceCategory,
            @RequestParam(defaultValue = "rating") String sortBy) {

        List<Restaurant> list;
        if (priceCategory != null && !priceCategory.isBlank() && !priceCategory.equalsIgnoreCase("ALL")) {
            list = restaurantRepository.findByCityIgnoreCaseAndPriceCategoryIgnoreCaseOrderByRatingDesc(city, priceCategory);
        } else {
            list = restaurantRepository.findByCityIgnoreCaseOrderByRatingDesc(city);
        }

        if ("price_low".equalsIgnoreCase(sortBy)) {
            list.sort((a, b) -> Integer.compare(a.getApproxCostForTwo(), b.getApproxCostForTwo()));
        } else if ("distance".equalsIgnoreCase(sortBy)) {
            list.sort((a, b) -> Integer.compare(a.getDistanceMeters(), b.getDistanceMeters()));
        }

        return ResponseEntity.ok(list);
    }
}