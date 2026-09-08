package com.trippilot.controller;

import com.trippilot.model.RegionalFood;
import com.trippilot.repository.RegionalFoodRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@CrossOrigin(origins = "*")
public class FoodController {

    private final RegionalFoodRepository regionalFoodRepository;

    public FoodController(RegionalFoodRepository regionalFoodRepository) {
        this.regionalFoodRepository = regionalFoodRepository;
    }

    @GetMapping
    public ResponseEntity<List<RegionalFood>> getRegionalFoods(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false, defaultValue = "false") Boolean budgetOnly) {

        List<RegionalFood> list;
        if (city != null && !city.isBlank()) {
            if (Boolean.TRUE.equals(budgetOnly)) {
                list = regionalFoodRepository.findByCityIgnoreCaseAndIsBudgetFriendlyTrue(city);
            } else if (maxPrice != null && maxPrice > 0) {
                list = regionalFoodRepository.findByCityIgnoreCaseAndTypicalPriceLessThanEqual(city, maxPrice);
            } else {
                list = regionalFoodRepository.findByCityIgnoreCase(city);
            }
        } else {
            list = regionalFoodRepository.findAll();
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegionalFood> getById(@PathVariable Long id) {
        return regionalFoodRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
