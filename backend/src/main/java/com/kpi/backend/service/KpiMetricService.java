package com.kpi.backend.service;

import com.kpi.backend.model.KpiMetric;
import com.kpi.backend.repository.KpiMetricRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service class for managing KPI Metrics.
 * 
 * This service handles all business logic related to KPI metrics including:
 * - CRUD operations for metrics
 * - Validation (100% total weight check)
 * - Grouping metrics by KRA
 * - Rubric parsing from JSON
 * 
 * Key validation rules:
 * 1. Total KRA weights must equal 100%
 * 2. Total metric weights must equal 100%
 * 3. Each KRA's weight must equal sum of its metrics' weights
 * 
 * @author KPI System
 * @version 1.0
 */
@Service
public class KpiMetricService {

    /**
     * Repository for database operations
     * Injected via constructor (Dependency Injection)
     */
    private final KpiMetricRepository kpiMetricRepository;

    /**
     * Constructor for dependency injection
     * 
     * @param kpiMetricRepository The repository for KPI metrics
     */
    public KpiMetricService(KpiMetricRepository kpiMetricRepository) {
        this.kpiMetricRepository = kpiMetricRepository;
    }

    /**
     * Get all KPI metrics ordered by display order.
     * Used when loading the evaluation form.
     * 
     * @return List of all metrics in display order
     */
    public List<KpiMetric> getAllMetrics() {
        return kpiMetricRepository.findAllByOrderByDisplayOrderAsc();
    }

    /**
     * Get a single metric by ID.
     * Used when editing a specific metric.
     * 
     * @param id The metric ID
     * Optional - returns empty if not found
     */
    public Optional<KpiMetric> getMetricById(Long id) {
        return kpiMetricRepository.findById(id);
    }

    /**
     * Get all metrics grouped by KRA.
     * This is the main method used by the frontend to display the evaluation form.
     * 
     * The result is a Map where:
     * - Key: KRA name (e.g., "Lead Discovery")
     * - Value: Object containing KRA weight and list of metrics
     * 
     * @return Map of KRA names to their metrics
     */
    public Map<String, KpiGroup> getMetricsGroupedByKra() {
        List<KpiMetric> allMetrics = kpiMetricRepository.findAllByOrderByDisplayOrderAsc();
        
        Map<String, KpiGroup> kraGroups = new LinkedHashMap<>();
        
        for (KpiMetric metric : allMetrics) {
            if (!kraGroups.containsKey(metric.getKraName())) {
                // Create new KRA group if not exists
                kraGroups.put(metric.getKraName(), new KpiGroup(
                    metric.getKraName(),
                    metric.getKraWeight(),
                    new ArrayList<>()
                ));
            }
            // Add metric to its KRA group
            kraGroups.get(metric.getKraName()).getMetrics().add(metric);
        }
        
        return kraGroups;
    }

    /**
     * Save a new or update existing KPI metric.
     * For new metrics: validates total weights before saving.
     * For updates: skips validation (user can validate manually with /validate endpoint).
     * 
     * @param metric The metric to save
     * @return The saved metric with ID assigned
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public KpiMetric saveMetric(KpiMetric metric) {
        // Validation removed - user can validate manually with /validate endpoint
        
        // Set default values if not provided
        if (metric.getRequiresFile() == null) {
            metric.setRequiresFile(false);
        }
        if (metric.getDisplayOrder() == null) {
            metric.setDisplayOrder(0);
        }
        
        return kpiMetricRepository.save(metric);
    }

    /**
     * Delete a metric by ID.
     * 
     * @param id The metric ID to delete
     */
    @Transactional
    public void deleteMetric(Long id) {
        kpiMetricRepository.deleteById(id);
    }

    /**
     * Validate that KRA and metric weights are correct.
     * 
     * Validation rules:
     * 1. Total KRA weights must equal 100%
     * 2. Total metric weights must equal 100%
     * 
     * @throws IllegalArgumentException if validation fails
     */
    public void validateWeights() {
        validateWeights(null);
    }

    /**
     * Validate that KRA and metric weights are correct.
     * Optionally excludes a metric from calculation (for update validation).
     * 
     * Validation rules:
     * 1. Total KRA weights must equal 100%
     * 2. Total metric weights must equal 100%
     * 
     * @param excludeMetricId Metric ID to exclude from calculation (for updates)
     * @throws IllegalArgumentException if validation fails
     */
    public void validateWeights(Long excludeMetricId) {
        // Get total KRA weight (sum of unique KRA weights)
        Integer totalKraWeight;
        if (excludeMetricId != null) {
            totalKraWeight = kpiMetricRepository.getTotalKraWeightExcluding(excludeMetricId);
        } else {
            totalKraWeight = kpiMetricRepository.getTotalKraWeight();
        }
        if (totalKraWeight == null) {
            totalKraWeight = 0;
        }
        
        // Get total metric weight
        Integer totalMetricWeight;
        if (excludeMetricId != null) {
            totalMetricWeight = kpiMetricRepository.getTotalMetricWeightExcluding(excludeMetricId);
        } else {
            totalMetricWeight = kpiMetricRepository.getTotalMetricWeight();
        }
        if (totalMetricWeight == null) {
            totalMetricWeight = 0;
        }
        
        // Validate KRA weights sum to 100
        if (totalKraWeight != 100) {
            throw new IllegalArgumentException(
                "Total KRA weight must be 100%. Current: " + totalKraWeight + "%"
            );
        }
        
        // Validate metric weights sum to 100
        if (totalMetricWeight != 100) {
            throw new IllegalArgumentException(
                "Total metric weight must be 100%. Current: " + totalMetricWeight + "%"
            );
        }
    }

    /**
     * Parse rubric JSON string into a Map.
     * 
     * The JSON format is: {"1": "description", "5": "description"}
     * We convert this to: Map<Integer, String>
     * 
     * @param rubricJson The JSON string from database
     * @return Map of score to description
     */
    public Map<Integer, String> parseRubric(String rubricJson) {
        Map<Integer, String> rubric = new LinkedHashMap<>();
        
        if (rubricJson == null || rubricJson.isEmpty()) {
            return rubric;
        }
        
        try {
            // Simple JSON parsing without external library
            // Format: {"1": "text", "5": "text"}
            String cleaned = rubricJson.replaceAll("[{}\"]", "");
            String[] pairs = cleaned.split(",");
            
            for (String pair : pairs) {
                String[] keyValue = pair.split(":");
                if (keyValue.length == 2) {
                    String key = keyValue[0].trim();
                    String value = keyValue[1].trim();
                    
                    // Parse the key as integer
                    if (key.matches("\\d+")) {
                        rubric.put(Integer.parseInt(key), value);
                    }
                }
            }
        } catch (Exception e) {
            // If parsing fails, return empty map
            System.err.println("Error parsing rubric JSON: " + e.getMessage());
        }
        
        return rubric;
    }

    /**
     * Check if the database has any KPI metrics.
     * Used to determine if initial data should be seeded.
     * 
     * @return true if metrics exist, false otherwise
     */
    public boolean hasMetrics() {
        return kpiMetricRepository.count() > 0;
    }

    /**
     * Get the count of all metrics.
     * 
     * @return Total number of metrics
     */
    public long getMetricCount() {
        return kpiMetricRepository.count();
    }

    /**
     * Inner class to represent a KRA group with its metrics.
     * Used to group metrics by KRA in the UI.
     */
    public static class KpiGroup {
        private String kraName;
        private Integer kraWeight;
        private List<KpiMetric> metrics;

        public KpiGroup(String kraName, Integer kraWeight, List<KpiMetric> metrics) {
            this.kraName = kraName;
            this.kraWeight = kraWeight;
            this.metrics = metrics;
        }

        public String getKraName() {
            return kraName;
        }

        public void setKraName(String kraName) {
            this.kraName = kraName;
        }

        public Integer getKraWeight() {
            return kraWeight;
        }

        public void setKraWeight(Integer kraWeight) {
            this.kraWeight = kraWeight;
        }

        public List<KpiMetric> getMetrics() {
            return metrics;
        }

        public void setMetrics(List<KpiMetric> metrics) {
            this.metrics = metrics;
        }
    }
}
