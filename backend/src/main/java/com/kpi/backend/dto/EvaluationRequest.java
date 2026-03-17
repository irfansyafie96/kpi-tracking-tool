package com.kpi.backend.dto;

import com.kpi.backend.model.EvaluationDetail;
import java.util.List;

public class EvaluationRequest {
    private Long memberId;
    private String evaluatorName;
    private List<EvaluationDetail> details;

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public String getEvaluatorName() {
        return evaluatorName;
    }

    public void setEvaluatorName(String evaluatorName) {
        this.evaluatorName = evaluatorName;
    }

    public List<EvaluationDetail> getDetails() {
        return details;
    }

    public void setDetails(List<EvaluationDetail> details) {
        this.details = details;
    }
}
