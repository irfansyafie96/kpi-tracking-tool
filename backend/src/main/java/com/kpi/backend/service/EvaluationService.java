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
        BigDecimal finalScore = calculateScore(details);
        String rating = mapToRating(finalScore);
        
        Evaluation evaluation = new Evaluation();
        evaluation.setMemberId(memberId);
        evaluation.setEvaluatorName(evaluatorName);
        evaluation.setFinalScore(finalScore);
        evaluation.setPerformanceRating(rating);
        
        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
        detailService.saveDetails(savedEvaluation.getId(), details);
        
        return savedEvaluation;
    }

    public BigDecimal calculateScore(List<EvaluationDetail> details) {
        BigDecimal totalPercentage = BigDecimal.ZERO;
        
        for (EvaluationDetail detail : details) {
            BigDecimal percentage = BigDecimal.valueOf(detail.getPercentageScore());
            totalPercentage = totalPercentage.add(percentage);
        }
        
        BigDecimal finalScore = totalPercentage.divide(BigDecimal.valueOf(25), 2, RoundingMode.HALF_UP);
        return finalScore;
    }

    public String mapToRating(BigDecimal score) {
        double value = score.doubleValue();
        
        if (value >= 3.50) return "Outstanding";
        if (value >= 3.00) return "Good";
        if (value >= 2.00) return "Average";
        return "Poor";
    }

    public List<Evaluation> getEvaluationsByMember(Long memberId) {
        return evaluationRepository.findByMemberId(memberId);
    }

    public List<Evaluation> getAllEvaluations() {
        return evaluationRepository.findAll();
    }
}
