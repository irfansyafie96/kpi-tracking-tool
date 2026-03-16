package com.kpi.backend.controller;

import com.kpi.backend.model.Evaluation;
import com.kpi.backend.model.ProjectMember;
import com.kpi.backend.service.EvaluationDetailService;
import com.kpi.backend.service.EvaluationService;
import com.kpi.backend.service.ProjectMemberService;
import com.kpi.backend.service.ProjectService;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ProjectService projectService;
    private final ProjectMemberService memberService;
    private final EvaluationService evaluationService;
    private final EvaluationDetailService detailService;

    public DashboardController(ProjectService projectService, 
                               ProjectMemberService memberService,
                               EvaluationService evaluationService,
                               EvaluationDetailService detailService) {
        this.projectService = projectService;
        this.memberService = memberService;
        this.evaluationService = evaluationService;
        this.detailService = detailService;
    }

    @GetMapping("/summary")
    public Map<String, Object> getGlobalSummary() {
        List<Evaluation> allEvaluations = evaluationService.getAllEvaluations();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalEvaluations", allEvaluations.size());
        
        if (allEvaluations.isEmpty()) {
            summary.put("averageScore", 0);
            summary.put("ratingBreakdown", Collections.emptyMap());
            return summary;
        }
        
        BigDecimal totalScore = BigDecimal.ZERO;
        Map<String, Integer> ratingCount = new HashMap<>();
        
        for (Evaluation eval : allEvaluations) {
            totalScore = totalScore.add(eval.getFinalScore());
            ratingCount.merge(eval.getPerformanceRating(), 1, Integer::sum);
        }
        
        BigDecimal avgScore = totalScore.divide(
            BigDecimal.valueOf(allEvaluations.size()), 
            2, 
            BigDecimal.ROUND_HALF_UP
        );
        
        summary.put("averageScore", avgScore);
        summary.put("ratingBreakdown", ratingCount);
        
        return summary;
    }

    @GetMapping("/project/{projectId}")
    public Map<String, Object> getProjectSummary(@PathVariable Long projectId) {
        List<ProjectMember> members = memberService.getMembersByProject(projectId);
        List<Map<String, Object>> memberScores = new ArrayList<>();
        
        for (ProjectMember member : members) {
            List<Evaluation> evals = evaluationService.getEvaluationsByMember(member.getId());
            if (!evals.isEmpty()) {
                Map<String, Object> memberData = new HashMap<>();
                memberData.put("memberId", member.getId());
                memberData.put("memberName", member.getMemberName());
                memberData.put("role", member.getRole());
                memberData.put("latestScore", evals.get(evals.size() - 1).getFinalScore());
                memberData.put("latestRating", evals.get(evals.size() - 1).getPerformanceRating());
                memberScores.add(memberData);
            }
        }
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("projectId", projectId);
        summary.put("membersEvaluated", memberScores.size());
        summary.put("memberScores", memberScores);
        
        return summary;
    }

    @GetMapping("/member/{memberId}")
    public Map<String, Object> getMemberSummary(@PathVariable Long memberId) {
        List<Evaluation> evaluations = evaluationService.getEvaluationsByMember(memberId);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("memberId", memberId);
        summary.put("totalEvaluations", evaluations.size());
        
        if (!evaluations.isEmpty()) {
            Evaluation latest = evaluations.get(evaluations.size() - 1);
            summary.put("latestScore", latest.getFinalScore());
            summary.put("latestRating", latest.getPerformanceRating());
            summary.put("latestEvaluationDate", latest.getEvaluationDate());
            
            List<Long> evalIds = evaluations.stream()
                .map(Evaluation::getId)
                .toList();
            Map<String, Double> kraScores = detailService.getKraScoresByEvaluationIds(evalIds);
            summary.put("kraScores", kraScores);
        }
        
        return summary;
    }

    @GetMapping("/kra-scores/member/{memberId}")
    public Map<String, Double> getKraScoresByMember(@PathVariable Long memberId) {
        List<Evaluation> evaluations = evaluationService.getEvaluationsByMember(memberId);
        
        if (evaluations.isEmpty()) {
            return Collections.emptyMap();
        }
        
        List<Long> evalIds = evaluations.stream()
            .map(Evaluation::getId)
            .toList();
        
        return detailService.getKraScoresByEvaluationIds(evalIds);
    }

    @GetMapping("/kra-scores/evaluation/{evaluationId}")
    public Map<String, Double> getKraScoresByEvaluation(@PathVariable Long evaluationId) {
        return detailService.getKraScoresByEvaluation(evaluationId);
    }
}
