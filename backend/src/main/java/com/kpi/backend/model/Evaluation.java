package com.kpi.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "evaluator_name", nullable = false)
    private String evaluatorName;

    @Column(name = "final_score", nullable = false, precision = 3, scale = 2)
    private BigDecimal finalScore;

    @Column(name = "performance_rating", nullable = false)
    private String performanceRating;

    @Column(name = "evaluation_date")
    private LocalDateTime evaluationDate;

    @PrePersist
    protected void onCreate() {
        evaluationDate = LocalDateTime.now();
    }
}
