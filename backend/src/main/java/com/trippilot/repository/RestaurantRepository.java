package com.trippilot.repository;

import com.trippilot.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByCityIgnoreCaseOrderByRatingDesc(String city);
    List<Restaurant> findByCityIgnoreCaseAndPriceCategoryIgnoreCaseOrderByRatingDesc(String city, String priceCategory);
}