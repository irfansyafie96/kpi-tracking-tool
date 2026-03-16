package com.kpi.backend.service;

import com.kpi.backend.model.EvaluationDetail;
import com.kpi.backend.repository.EvaluationDetailRepository;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EvaluationDetailService {

    private final EvaluationDetailRepository detailRepository;

    public EvaluationDetailService(EvaluationDetailRepository detailRepository) {
        this.detailRepository = detailRepository;
    }

    public List<EvaluationDetail> saveDetails(Long evaluationId, List<EvaluationDetail> details) {
        for (EvaluationDetail detail : details) {
            detail.setEvaluationId(evaluationId);
        }
        return detailRepository.saveAll(details);
    }

    public List<EvaluationDetail> getDetailsByEvaluation(Long evaluationId) {
        return detailRepository.findByEvaluationId(evaluationId);
    }

    public Map<String, Double> getKraScoresByEvaluationIds(List<Long> evaluationIds) {
        List<Object[]> results = detailRepository.findAvgScoreByKra(evaluationIds);
        Map<String, Double> kraScores = new HashMap<>();
        
        for (Object[] row : results) {
            String kraName = (String) row[0];
            Double avgScore = ((Number) row[1]).doubleValue();
            kraScores.put(kraName, avgScore);
        }
        
        return kraScores;
    }

    public Map<String, Double> getKraScoresByEvaluation(Long evaluationId) {
        List<Object[]> results = detailRepository.findAvgScoreByKraForEvaluation(evaluationId);
        Map<String, Double> kraScores = new HashMap<>();
        
        for (Object[] row : results) {
            String kraName = (String) row[0];
            Double avgScore = ((Number) row[1]).doubleValue();
            kraScores.put(kraName, avgScore);
        }
        
        return kraScores;
    }
}
