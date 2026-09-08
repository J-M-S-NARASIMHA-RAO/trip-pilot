package com.trippilot.repository;

import com.trippilot.model.Accommodation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccommodationRepository extends JpaRepository<Accommodation, Long> {
    List<Accommodation> findByCityIgnoreCase(String city);
    List<Accommodation> findByCityIgnoreCaseAndTypeIgnoreCase(String city, String type);
    List<Accommodation> findByCityIgnoreCaseAndPricePerNightLessThanEqual(String city, Double maxPrice);
}
