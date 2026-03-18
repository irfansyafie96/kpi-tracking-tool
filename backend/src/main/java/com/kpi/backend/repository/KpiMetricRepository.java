package com.kpi.backend.repository;

import com.kpi.backend.model.KpiMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository interface for KpiMetric entity.
 * 
 * Provides database access methods for KPI metrics.
 * Spring Data JPA automatically implements basic CRUD operations.
 * 
 * Custom queries provided:
 * - findAllOrdered(): Get all metrics sorted by display order
 * - findByKraName(): Get metrics for a specific KRA
 * - getTotalKraWeight(): Sum of all unique KRA weights
 * - getTotalMetricWeight(): Sum of all metric weights
 * 
 * @author KPI System
 * @version 1.0
 */
@Repository
public interface KpiMetricRepository extends JpaRepository<KpiMetric, Long> {

    /**
     * Find all KPI metrics ordered by display_order
     * Used when loading the evaluation form
     * 
     * @return List of all metrics in display order
     */
    List<KpiMetric> findAllByOrderByDisplayOrderAsc();

    /**
     * Find all metrics belonging to a specific KRA
     * Used when grouping metrics by KRA in the UI
     * 
     * @param kraName The KRA name to filter by
     * @return List of metrics in that KRA
     */
    List<KpiMetric> findByKraNameOrderByDisplayOrderAsc(String kraName);

    /**
     * Get the sum of unique KRA weights
     * Used to validate that total KRA weights = 100%
     * 
     * @return Sum of distinct kra_weight values
     */
    @Query("SELECT SUM(DISTINCT km.kraWeight) FROM KpiMetric km")
    Integer getTotalKraWeight();

    /**
     * Get the sum of all metric weights
     * Used to validate that total metric weights = 100%
     * 
     * @return Sum of all metric_weight values
     */
    @Query("SELECT SUM(km.metricWeight) FROM KpiMetric km")
    Integer getTotalMetricWeight();

    /**
     * Get sum of metric weights for a specific KRA
     * Used to validate KRA weight = sum of its metrics
     * 
     * @param kraName The KRA name
     * @return Sum of metric weights in that KRA
     */
    @Query("SELECT SUM(km.metricWeight) FROM KpiMetric km WHERE km.kraName = :kraName")
    Integer getTotalWeightByKra(String kraName);

    /**
     * Get unique KRA names in order
     * Used to build KRA groupings in the UI
     * 
     * @return List of distinct KRA names
     */
    @Query("SELECT DISTINCT km.kraName FROM KpiMetric km ORDER BY MIN(km.displayOrder)")
    List<String> findDistinctKraNames();

    /**
     * Count metrics by KRA name
     * Used for validation
     * 
     * @param kraName The KRA name
     * @return Number of metrics in that KRA
     */
    Long countByKraName(String kraName);
}
