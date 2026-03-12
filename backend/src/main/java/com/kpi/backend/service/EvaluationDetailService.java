package com.kpi.backend.service;

import com.kpi.backend.model.EvaluationDetail;
import com.kpi.backend.repository.EvaluationDetailRepository;
import org.springframework.stereotype.Service;
import java.util.List;

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
}
