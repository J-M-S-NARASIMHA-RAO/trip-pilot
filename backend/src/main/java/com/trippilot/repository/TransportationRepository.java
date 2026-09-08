package com.trippilot.repository;

import com.trippilot.model.Transportation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransportationRepository extends JpaRepository<Transportation, Long> {
    List<Transportation> findByTypeIgnoreCase(String type);
}
