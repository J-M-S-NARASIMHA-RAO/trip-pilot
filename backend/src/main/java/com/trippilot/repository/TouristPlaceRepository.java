package com.trippilot.repository;

import com.trippilot.model.TouristPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TouristPlaceRepository extends JpaRepository<TouristPlace, Long> {
    List<TouristPlace> findByCityIgnoreCase(String city);
}
