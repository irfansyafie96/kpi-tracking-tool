import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id: number;
  projectName: string;
  createdAt?: string;
}

export interface ProjectMember {
  id: number;
  memberName: string;
  role: 'BA' | 'QA';
}

export interface DashboardSummary {
  totalEvaluations: number;
  averageScore: number;
  ratingBreakdown: { [key: string]: number };
}

export interface MemberScore {
  memberId: number;
  memberName: string;
  role: string;
  latestScore: number;
  latestRating: string;
}

export interface ProjectSummary {
  projectId: number;
  membersEvaluated: number;
  memberScores: MemberScore[];
}

export interface MemberSummary {
  memberId: number;
  totalEvaluations: number;
  latestScore: number;
  latestRating: string;
  latestEvaluationDate: string;
  kraScores: { [key: string]: number };
}

export interface EvaluationDetail {
  id: number;
  evaluationId: number;
  kraName: string;
  metricName: string;
  evidenceReviewed: string;
  percentageScore: number;
  evidenceRemarks: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/projects`);
  }

  createProject(projectName: string): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/projects`, { projectName });
  }

  getMembersByProject(projectId: number): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(`${this.apiUrl}/projects/${projectId}/members`);
  }

  getGlobalSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard/summary`);
  }

  getProjectSummary(projectId: number): Observable<ProjectSummary> {
    return this.http.get<ProjectSummary>(`${this.apiUrl}/dashboard/project/${projectId}`);
  }

  getMemberSummary(memberId: number): Observable<MemberSummary> {
    return this.http.get<MemberSummary>(`${this.apiUrl}/dashboard/member/${memberId}`);
  }

  getKraScoresByMember(memberId: number): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/dashboard/kra-scores/member/${memberId}`);
  }

  getEvaluationDetails(evaluationId: number): Observable<EvaluationDetail[]> {
    return this.http.get<EvaluationDetail[]>(`${this.apiUrl}/evaluations/${evaluationId}/details`);
  }

  getEvaluationsByMember(memberId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/evaluations/member/${memberId}`);
  }
}
