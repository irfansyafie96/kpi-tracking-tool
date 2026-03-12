package com.kpi.backend.repository;

import com.kpi.backend.model.EvaluationDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvaluationDetailRepository extends JpaRepository<EvaluationDetail, Long> {
    
    List<EvaluationDetail> findByEvaluationId(Long evaluationId);
}
