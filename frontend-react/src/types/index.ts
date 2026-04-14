export interface User {
  id: number;
  email: string;
  name: string;
  role: 'PM' | 'PD' | 'BA' | 'QA';
  created_at?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface KpiMetric {
  id: number;
  kra_name: string;
  kra_weight: number;
  metric_name: string;
  evidence: string;
  metric_weight: number;
  rubric_json: string;
  requires_file: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface KpiGroup {
  kra_weight: number;
  metrics: KpiMetric[];
}

export interface Project {
  id: number;
  project_name: string;
  created_at?: string;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  member_name: string;
  role: string;
  created_at?: string;
}

export interface EvaluationDetailSubmit {
  metric_id: number | null;
  kra_name: string;
  metric_name: string;
  evidence_reviewed: string | null;
  percentage_score: number;
  evidence_remarks: string | null;
  file_path: string | null;
}

export interface EvaluationSubmit {
  member_id: number;
  evaluator_name: string;
  details: EvaluationDetailSubmit[];
}

export interface DashboardSummary {
  total_evaluations: number;
  average_score: number;
  rating_breakdown: Record<string, number>;
}

export interface MemberScore {
  member_id: number;
  member_name: string;
  role: string;
  latest_score: number;
  latest_rating: string;
}

export interface ProjectSummary {
  project_id: number;
  members_evaluated: number;
  member_scores: MemberScore[];
}

export interface MemberSummary {
  member_id: number;
  total_evaluations: number;
  latest_score: number | null;
  latest_rating: string | null;
  latest_evaluation_date: string | null;
  kra_scores: Record<string, number>;
}

export interface EvaluationDetail {
  id: number;
  evaluation_id: number;
  metric_id: number | null;
  kra_name: string;
  metric_name: string;
  evidence_reviewed: string | null;
  percentage_score: number;
  evidence_remarks: string | null;
  file_path: string | null;
}

export interface Evaluation {
  id: number;
  member_id: number;
  evaluator_name: string;
  final_score: number;
  performance_rating: string;
  evaluation_date?: string;
}
