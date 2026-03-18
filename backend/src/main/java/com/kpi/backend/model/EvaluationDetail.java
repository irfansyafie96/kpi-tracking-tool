package com.kpi.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Entity class representing an evaluation detail (one metric answer).
 * 
 * This stores the answer for each metric in an evaluation.
 * For snapshot functionality, we also store the metric_id reference.
 * 
 * @author KPI System
 * @version 2.0
 */
@Entity
@Table(name = "evaluation_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Reference to the parent evaluation
     */
    @Column(name = "evaluation_id", nullable = false)
    private Long evaluationId;

    /**
     * Reference to kpi_metrics table for snapshot
     * This allows evaluations to keep original KPIs even if they change later
     */
    @Column(name = "metric_id")
    private Long metricId;

    /**
     * KRA name (stored for snapshot)
     */
    @Column(name = "kra_name", nullable = false)
    private String kraName;

    /**
     * Metric/question name (stored for snapshot)
     */
    @Column(name = "metric_name", nullable = false)
    private String metricName;

    /**
     * Evidence required/reviewed for this metric
     */
    @Column(name = "evidence_reviewed")
    private String evidenceReviewed;

    /**
     * Percentage score given (1 to max metric_weight)
     */
    @Column(name = "percentage_score", nullable = false)
    private Integer percentageScore;

    /**
     * PM's remarks/justification for the score
     */
    @Column(name = "evidence_remarks", columnDefinition = "TEXT")
    private String evidenceRemarks;

    /**
     * Path to uploaded file (if requires_file is true)
     */
    @Column(name = "file_path", length = 500)
    private String filePath;
}
