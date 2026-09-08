package com.trippilot.repository;

import com.trippilot.model.FareData;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FareDataRepository extends JpaRepository<FareData, Long> {
    Optional<FareData> findByTransportationTypeIgnoreCaseAndCityIgnoreCase(String transportationType, String city);
    Optional<FareData> findFirstByTransportationTypeIgnoreCase(String transportationType);
}
