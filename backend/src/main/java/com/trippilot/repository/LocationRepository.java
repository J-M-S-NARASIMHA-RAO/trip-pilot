package com.trippilot.repository;

import com.trippilot.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByCityIgnoreCase(String city);
    Optional<Location> findByNameIgnoreCase(String name);
    List<Location> findByNameContainingIgnoreCase(String query);
}
