package com.kpi.backend.controller;

import com.kpi.backend.dto.EvaluationRequest;
import com.kpi.backend.model.Evaluation;
import com.kpi.backend.model.EvaluationDetail;
import com.kpi.backend.service.EvaluationDetailService;
import com.kpi.backend.service.EvaluationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    private final EvaluationService evaluationService;
    private final EvaluationDetailService detailService;

    public EvaluationController(EvaluationService evaluationService, EvaluationDetailService detailService) {
        this.evaluationService = evaluationService;
        this.detailService = detailService;
    }

    @PostMapping
    public Evaluation submitEvaluation(@RequestBody EvaluationRequest request) {
        return evaluationService.submitEvaluation(
            request.getMemberId(), 
            request.getEvaluatorName(), 
            request.getDetails()
        );
    }

    @GetMapping
    public List<Evaluation> getAllEvaluations() {
        return evaluationService.getAllEvaluations();
    }

    @GetMapping("/member/{memberId}")
    public List<Evaluation> getEvaluationsByMember(@PathVariable Long memberId) {
        return evaluationService.getEvaluationsByMember(memberId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evaluation> getEvaluationById(@PathVariable Long id) {
        return evaluationService.getAllEvaluations().stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/details")
    public List<EvaluationDetail> getEvaluationDetails(@PathVariable Long id) {
        return detailService.getDetailsByEvaluation(id);
    }
}
