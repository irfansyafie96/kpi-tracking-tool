package com.kpi.backend.repository;

import com.kpi.backend.model.EvaluationDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvaluationDetailRepository extends JpaRepository<EvaluationDetail, Long> {
    
    List<EvaluationDetail> findByEvaluationId(Long evaluationId);
    
    @Query("SELECT e.kraName, AVG(e.percentageScore) FROM EvaluationDetail e WHERE e.evaluationId IN :evaluationIds GROUP BY e.kraName")
    List<Object[]> findAvgScoreByKra(@Param("evaluationIds") List<Long> evaluationIds);
    
    @Query("SELECT e.kraName, AVG(e.percentageScore) FROM EvaluationDetail e WHERE e.evaluationId = :evaluationId GROUP BY e.kraName")
    List<Object[]> findAvgScoreByKraForEvaluation(@Param("evaluationId") Long evaluationId);
}
