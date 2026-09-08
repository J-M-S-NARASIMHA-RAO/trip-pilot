package com.trippilot.repository;

import com.trippilot.model.RegionalFood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegionalFoodRepository extends JpaRepository<RegionalFood, Long> {
    List<RegionalFood> findByCityIgnoreCase(String city);
    List<RegionalFood> findByCityIgnoreCaseAndTypicalPriceLessThanEqual(String city, Double maxPrice);
    List<RegionalFood> findByCityIgnoreCaseAndIsBudgetFriendlyTrue(String city);
}
