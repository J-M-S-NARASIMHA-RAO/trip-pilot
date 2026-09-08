package com.trippilot.repository;

import com.trippilot.model.TariffRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TariffRuleRepository extends JpaRepository<TariffRule, Long> {
    List<TariffRule> findByCityIgnoreCase(String city);
    Optional<TariffRule> findByCityIgnoreCaseAndVehicleTypeIgnoreCase(String city, String vehicleType);
}
