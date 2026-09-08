package com.trippilot.repository;

import com.trippilot.model.TransitHub;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransitHubRepository extends JpaRepository<TransitHub, Long> {
    List<TransitHub> findByCityIgnoreCase(String city);
    List<TransitHub> findByCityIgnoreCaseAndHubTypeIgnoreCase(String city, String hubType);
}
