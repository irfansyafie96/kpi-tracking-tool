package com.kpi.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "evaluation_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "evaluation_id", nullable = false)
    private Long evaluationId;

    @Column(name = "kra_name", nullable = false)
    private String kraName;

    @Column(name = "metric_name", nullable = false)
    private String metricName;

    @Column(name = "evidence_reviewed")
    private String evidenceReviewed;

    @Column(name = "percentage_score", nullable = false)
    private Integer percentageScore;

    @Column(name = "evidence_remarks", columnDefinition = "TEXT")
    private String evidenceRemarks;
}
