package com.trippilot.controller;

import com.trippilot.model.Accommodation;
import com.trippilot.repository.AccommodationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accommodations")
@CrossOrigin(origins = "*")
public class AccommodationController {

    private final AccommodationRepository accommodationRepository;

    public AccommodationController(AccommodationRepository accommodationRepository) {
        this.accommodationRepository = accommodationRepository;
    }

    @GetMapping
    public ResponseEntity<List<Accommodation>> getAccommodations(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Double maxPrice) {

        List<Accommodation> list;
        if (city != null && !city.isBlank()) {
            if (type != null && !type.isBlank()) {
                list = accommodationRepository.findByCityIgnoreCaseAndTypeIgnoreCase(city, type);
            } else if (maxPrice != null && maxPrice > 0) {
                list = accommodationRepository.findByCityIgnoreCaseAndPricePerNightLessThanEqual(city, maxPrice);
            } else {
                list = accommodationRepository.findByCityIgnoreCase(city);
            }
        } else {
            list = accommodationRepository.findAll();
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Accommodation> getById(@PathVariable Long id) {
        return accommodationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
