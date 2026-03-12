package com.kpi.backend.service;

import com.kpi.backend.model.Evaluation;
import com.kpi.backend.model.EvaluationDetail;
import com.kpi.backend.repository.EvaluationRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final EvaluationDetailService detailService;

    public EvaluationService(EvaluationRepository evaluationRepository, 
                             EvaluationDetailService detailService) {
        this.evaluationRepository = evaluationRepository;
        this.detailService = detailService;
    }

    public Evaluation submitEvaluation(Long memberId, String evaluatorName, 
                                       List<EvaluationDetail> details) {
        // Calculate final score
        BigDecimal finalScore = calculateScore(details);
        
        // Map to performance rating
        String rating = mapToRating(finalScore);
        
        // Create evaluation
        Evaluation evaluation = new Evaluation();
        evaluation.setMemberId(memberId);
        evaluation.setEvaluatorName(evaluatorName);
        evaluation.setFinalScore(finalScore);
        evaluation.setPerformanceRating(rating);
        
        // Save evaluation first
        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
        
        // Save details with evaluation ID
        detailService.saveDetails(savedEvaluation.getId(), details);
        
        return savedEvaluation;
    }

    public BigDecimal calculateScore(List<EvaluationDetail> details) {
        BigDecimal totalScore = BigDecimal.ZERO;
        
        for (EvaluationDetail detail : details) {
            BigDecimal weight = getMetricWeight(detail.getMetricName());
            BigDecimal score = BigDecimal.valueOf(detail.getScoreGiven());
            totalScore = totalScore.add(score.multiply(weight));
        }
        
        return totalScore.setScale(2, RoundingMode.HALF_UP);
    }

    public String mapToRating(BigDecimal score) {
        double value = score.doubleValue();
        
        if (value >= 3.50) return "Outstanding";
        if (value >= 3.00) return "Good";
        if (value >= 2.00) return "Average";
        return "Poor";
    }

    private BigDecimal getMetricWeight(String metricName) {
        // KPI weights based on REQUIREMENTS.md
        switch (metricName) {
            // Lead Discovery (20% total - 4 metrics = 5% each)
            case "% of requirements ready before dev starts":
            case "% of test scenarios identified before QA phase":
            case "Early risk logs":
            case "Stakeholder clarity feedback":
                return new BigDecimal("0.05");
                
            // Team Building (15% total - 3 metrics)
            case "Collaboration with BA/dev":
            case "Mentorship provided":
            case "Support during crunch periods":
                return new BigDecimal("0.05");
                
            // Communication (15% total - 3 metrics)
            case "Rework due to unclear requirements":
            case "Defect clarity":
            case "Response time to questions":
                return new BigDecimal("0.05");
                
            // Prioritization (10% total - 2 metrics = 5% each)
            case "Risk-based prioritization":
            case "Handling scope changes":
                return new BigDecimal("0.05");
                
            // Problem Solving (20% total - 3 metrics: 7%, 7%, 6%)
            case "Escalation frequency":
                return new BigDecimal("0.07");
            case "Time taken to resolve blockers":
                return new BigDecimal("0.07");
            case "Ability to negotiate requirement conflicts":
                return new BigDecimal("0.06");
                
            // Process Efficiency (20% total - 3 metrics: 7%, 7%, 6%)
            case "Rework rate":
                return new BigDecimal("0.07");
            case "On-time documentation":
                return new BigDecimal("0.07");
            case "Test deliverable timeline":
                return new BigDecimal("0.06");
                
            default:
                return BigDecimal.ZERO;
        }
    }

    public List<Evaluation> getEvaluationsByMember(Long memberId) {
        return evaluationRepository.findByMemberId(memberId);
    }

    public List<Evaluation> getAllEvaluations() {
        return evaluationRepository.findAll();
    }
}
