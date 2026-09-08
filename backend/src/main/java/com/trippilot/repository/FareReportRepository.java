package com.trippilot.repository;

import com.trippilot.model.FareReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FareReportRepository extends JpaRepository<FareReport, Long> {
    List<FareReport> findBySourceIgnoreCaseAndDestinationIgnoreCase(String source, String destination);
}
