package com.kpi.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity class representing a KPI Metric in the system.
 * 
 * This class maps to the 'kpi_metrics' table in the database.
 * Each record represents one metric question that PMs use to evaluate BAs/QAs.
 * 
 * Key features:
 * - Metrics are grouped by KRA (Key Result Area)
 * - Each metric has a weight (percentage within the KRA)
 * - Rubrics are stored as JSON for flexibility
 * - Can flag if file upload is required for evidence
 * 
 * @author KPI System
 * @version 1.0
 */
@Entity
@Table(name = "kpi_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KpiMetric {

    /**
     * Primary key - auto-generated ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * KRA (Key Result Area) name - groups metrics together
     * Examples: "Lead Discovery", "Team Building", "Communication"
     */
    @Column(name = "kra_name", nullable = false)
    private String kraName;

    /**
     * Weight percentage for this entire KRA
     * Examples: 20, 15, 10 (must sum to 100 across all KRAs)
     */
    @Column(name = "kra_weight", nullable = false)
    private Integer kraWeight;

    /**
     * The actual metric/question text
     * Example: "% of requirements ready before dev starts"
     */
    @Column(name = "metric_name", nullable = false)
    private String metricName;

    /**
     * Evidence required to evaluate this metric
     * Example: "BRD / FSD", "Test Script"
     */
    @Column(name = "evidence")
    private String evidence;

    /**
     * Weight for this specific metric within its KRA
     * Example: 5 (meaning this metric is worth 5% of the KRA's weight)
     */
    @Column(name = "metric_weight", nullable = false)
    private Integer metricWeight;

    /**
     * Rubric stored as JSON format
     * Maps score levels to descriptions
     * Example: {"1": "1% - Poor", "5": "5% - Excellent"}
     */
    @Column(name = "rubric_json", columnDefinition = "text")
    private String rubricJson;

    /**
     * Boolean flag indicating if this metric requires file upload
     * as evidence
     * Example: true for metrics that need document proof
     */
    @Column(name = "requires_file")
    private Boolean requiresFile = false;

    /**
     * Display order for sorting metrics in the UI
     * Lower numbers appear first
     */
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    /**
     * Timestamp when this record was created
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * Timestamp when this record was last updated
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Lifecycle hook - runs before persisting a new entity
     * Sets the createdAt timestamp
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * Lifecycle hook - runs before updating an existing entity
     * Sets the updatedAt timestamp
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
