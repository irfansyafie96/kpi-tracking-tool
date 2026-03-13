import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { KRA, Metric, KPI_DATA } from '../../models/kpi-data';

interface Project {
  id: number;
  projectName: string;
}

interface ProjectMember {
  id: number;
  memberName: string;
  role: 'BA' | 'QA';
}

interface MetricScore {
  kraName: string;
  metricName: string;
  evidenceReviewed: string;
  scoreGiven: number | null;
  evidenceRemarks: string;
}

@Component({
  selector: 'app-pm-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pm-evaluation.component.html',
  styleUrls: ['./pm-evaluation.component.css']
})
export class PmEvaluationComponent implements OnInit {
  kpiData = KPI_DATA;
  projects: Project[] = [];
  members: ProjectMember[] = [];
  
  selectedProjectId: number | null = null;
  selectedMemberId: number | null = null;
  evaluatorName: string = '';
  
  newMemberName: string = '';
  newMemberRole: 'BA' | 'QA' = 'BA';
  
  metrics: MetricScore[] = [];
  isSubmitting = false;
  submitSuccess = false;
  errorMessage = '';
  
  showAddMember = false;
  @Output() goBack = new EventEmitter<void>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initMetrics();
    this.loadProjects();
  }

  initMetrics() {
    this.metrics = [];
    for (const kra of this.kpiData) {
      for (const metric of kra.metrics) {
        this.metrics.push({
          kraName: kra.name,
          metricName: metric.name,
          evidenceReviewed: metric.evidence,
          scoreGiven: null,
          evidenceRemarks: ''
        });
      }
    }
  }

  loadProjects() {
    this.http.get<Project[]>('http://localhost:8080/api/projects')
      .subscribe({
        next: (data) => this.projects = data,
        error: (err) => console.error('Error loading projects:', err)
      });
  }

  onProjectChange() {
    this.selectedMemberId = null;
    this.members = [];
    this.submitSuccess = false;
    this.errorMessage = '';
    
    if (this.selectedProjectId) {
      this.http.get<ProjectMember[]>(`http://localhost:8080/api/projects/${this.selectedProjectId}/members`)
        .subscribe({
          next: (data) => this.members = data,
          error: (err) => console.error('Error loading members:', err)
        });
    }
  }

  addMember() {
    if (!this.selectedProjectId || !this.newMemberName.trim()) return;

    this.http.post<ProjectMember>(
      `http://localhost:8080/api/projects/${this.selectedProjectId}/members`,
      { memberName: this.newMemberName, role: this.newMemberRole }
    ).subscribe({
      next: (member) => {
        this.members.push(member);
        this.newMemberName = '';
        this.showAddMember = false;
      },
      error: (err) => console.error('Error adding member:', err)
    });
  }

  get completedCount(): number {
    return this.metrics.filter(m => m.scoreGiven !== null && m.evidenceRemarks.trim().length > 0).length;
  }

  get isFormValid(): boolean {
    return (
      this.selectedProjectId !== null &&
      this.selectedMemberId !== null &&
      this.evaluatorName.trim().length > 0 &&
      this.completedCount === this.metrics.length
    );
  }

  submitEvaluation() {
    if (!this.isFormValid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      memberId: this.selectedMemberId,
      evaluatorName: this.evaluatorName,
      details: this.metrics
    };

    this.http.post<any>('http://localhost:8080/api/evaluations', payload)
      .subscribe({
        next: (result) => {
          this.isSubmitting = false;
          this.submitSuccess = true;
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to submit evaluation. Please try again.';
          console.error('Error submitting evaluation:', err);
        }
      });
  }

  reset() {
    this.selectedProjectId = null;
    this.selectedMemberId = null;
    this.evaluatorName = '';
    this.members = [];
    this.submitSuccess = false;
    this.errorMessage = '';
    this.initMetrics();
  }

  goToBack() {
    this.goBack.emit();
  }

  getMetricScore(kraName: string, metricName: string): number | null {
    const metric = this.metrics.find(m => m.kraName === kraName && m.metricName === metricName);
    return metric?.scoreGiven ?? null;
  }

  setScore(kraName: string, metricName: string, score: number) {
    const metric = this.metrics.find(m => m.kraName === kraName && m.metricName === metricName);
    if (metric) {
      metric.scoreGiven = score;
    }
  }

  getMetricRef(kraName: string, metricName: string): MetricScore {
    return this.metrics.find(m => m.kraName === kraName && m.metricName === metricName)!;
  }

  getRubricText(kraName: string, metricName: string): string {
    const kra = this.kpiData.find(k => k.name === kraName);
    if (!kra) return '';
    const metric = kra.metrics.find(m => m.name === metricName);
    if (!metric) return '';
    
    const score = this.getMetricScore(kraName, metricName);
    if (score === null) return 'Select a score to see rubric';
    return metric.rubric[score];
  }
}
