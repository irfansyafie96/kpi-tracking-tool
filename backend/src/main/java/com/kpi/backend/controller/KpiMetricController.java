package com.kpi.backend.controller;

import com.kpi.backend.model.KpiMetric;
import com.kpi.backend.service.KpiMetricService;
import com.kpi.backend.service.KpiMetricService.KpiGroup;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for KPI Metrics.
 * 
 * Provides API endpoints for:
 * - GET /api/kpi-metrics: Get all metrics (flat list)
 * - GET /api/kpi-metrics/grouped: Get metrics grouped by KRA
 * - GET /api/kpi-metrics/{id}: Get single metric
 * - POST /api/kpi-metrics: Create new metric
 * - PUT /api/kpi-metrics/{id}: Update existing metric
 * - DELETE /api/kpi-metrics/{id}: Delete metric
 * - GET /api/kpi-metrics/validate: Validate weight totals
 * 
 * @author KPI System
 * @version 1.0
 */
@RestController
@RequestMapping("/api/kpi-metrics")
public class KpiMetricController {

    /**
     * Service for KPI metric business logic
     */
    private final KpiMetricService kpiMetricService;

    /**
     * Constructor for dependency injection
     * 
     * @param kpiMetricService The service handling KPI metric logic
     */
    public KpiMetricController(KpiMetricService kpiMetricService) {
        this.kpiMetricService = kpiMetricService;
    }

    /**
     * Get all KPI metrics as a flat list.
     * Ordered by display_order.
     * 
     * @return List of all metrics
     */
    @GetMapping
    public List<KpiMetric> getAllMetrics() {
        return kpiMetricService.getAllMetrics();
    }

    /**
     * Get all metrics grouped by KRA.
     * This is the main endpoint for the frontend evaluation form.
     * 
     * Response structure:
     * {
     *   "Lead Discovery": {
     *     "kraWeight": 20,
     *     "metrics": [ ... ]
     *   },
     *   "Team Building": { ... }
     * }
     * 
     * @return Map of KRA names to their groups
     */
    @GetMapping("/grouped")
    public Map<String, KpiGroup> getMetricsGroupedByKra() {
        return kpiMetricService.getMetricsGroupedByKra();
    }

    /**
     * Get a single metric by ID.
     * Used when editing a specific metric.
     * 
     * @param id The metric ID
     * @return The metric if found, 404 otherwise
     */
    @GetMapping("/{id}")
    public ResponseEntity<KpiMetric> getMetricById(@PathVariable Long id) {
        return kpiMetricService.getMetricById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new KPI metric.
     * 
     * Request body should contain:
     * - kraName: KRA name (e.g., "Lead Discovery")
     * - kraWeight: KRA weight (e.g., 20)
     * - metricName: The question/metric text
     * - evidence: Evidence required
     * - metricWeight: Weight within KRA (e.g., 5)
     * - rubricJson: JSON format rubric (e.g., "{\"1\": \"1%\", \"5\": \"5%\"}")
     * - requiresFile: Boolean for file upload requirement
     * - displayOrder: Order in list
     * 
     * @param metric The metric to create
     * @return The created metric with 201 status
     */
    @PostMapping
    public ResponseEntity<?> createMetric(@RequestBody KpiMetric metric) {
        try {
            // Save without validation - user can validate manually with /validate endpoint
            KpiMetric saved = kpiMetricService.saveMetric(metric);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update an existing KPI metric.
     * 
     * @param id The metric ID to update
     * @param metric The updated metric data
     * @return The updated metric or 404 if not found
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMetric(@PathVariable Long id, @RequestBody KpiMetric metric) {
        // Check if metric exists
        if (!kpiMetricService.getMetricById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            // Set the ID to ensure we update, not create
            metric.setId(id);
            
            // Save without validation - user can validate manually with /validate endpoint
            KpiMetric updated = kpiMetricService.saveMetric(metric);
            
            return ResponseEntity.ok(updated);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a KPI metric.
     * 
     * @param id The metric ID to delete
     * @return 204 No Content if successful, 404 if not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMetric(@PathVariable Long id) {
        // Check if metric exists first
        if (!kpiMetricService.getMetricById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        kpiMetricService.deleteMetric(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Validate that KRA and metric weights total 100%.
     * 
     * This endpoint can be called before saving to give
     * users early feedback on weight totals.
     * 
     * @return Validation result with current totals
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateWeights() {
        try {
            kpiMetricService.validateWeights();
            
            // If we get here, validation passed
            return ResponseEntity.ok(Map.of(
                "valid", true,
                "message", "All weights are valid (total = 100%)"
            ));
            
        } catch (IllegalArgumentException e) {
            // Validation failed - return 200 with valid:false (not 400 error)
            return ResponseEntity.ok(Map.of(
                "valid", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Check if KPI metrics exist in the database.
     * Used by frontend to determine if initial load is needed.
     * 
     * @return Object with count and hasData flag
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(Map.of(
            "hasData", kpiMetricService.hasMetrics(),
            "count", kpiMetricService.getMetricCount()
        ));
    }
}
