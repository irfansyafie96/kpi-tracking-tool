import { Component, OnInit, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService, Project, ProjectMember, DashboardSummary, MemberSummary, EvaluationDetail } from './dashboard.service';
declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  projects: Project[] = [];
  members: ProjectMember[] = [];
  
  selectedProjectId: number | null = null;
  selectedMemberId: number | null = null;
  
  summary: DashboardSummary | null = null;
  memberSummary: MemberSummary | null = null;
  evaluationDetails: EvaluationDetail[] = [];
  
  showCreateProject = false;
  newProjectName: string = '';
  
  @Output() goBack = new EventEmitter<void>();
  @Output() goToKpiSetup = new EventEmitter<void>();

  radarChartData: ChartData<'radar'> = {
    labels: ['Lead Discovery', 'Team Building', 'Communication', 'Prioritization', 'Problem Solving', 'Process Efficiency'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        label: 'KRA Scores',
        backgroundColor: 'rgba(103, 89, 122, 0.2)',
        borderColor: 'rgba(103, 89, 122, 1)',
        pointBackgroundColor: 'rgba(103, 89, 122, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(103, 89, 122, 1)'
      }
    ]
  };

  radarChartOptions: ChartConfiguration<'radar'>['options'] = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadProjects();
    this.loadGlobalSummary();
  }

  ngAfterViewInit() {
    // Initialize toast elements
  }

  showSuccessToast(message: string) {
    const toastEl = document.getElementById('successToast');
    const toastBody = document.getElementById('successToastBody');
    if (toastEl && toastBody) {
      toastBody.textContent = message;
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  showErrorToast(message: string) {
    const toastEl = document.getElementById('errorToast');
    const toastBody = document.getElementById('errorToastBody');
    if (toastEl && toastBody) {
      toastBody.textContent = message;
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  loadProjects() {
    this.dashboardService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[DEBUG] Error loading projects:', err);
        this.showErrorToast('Failed to load projects. Please refresh the page.');
        this.cdr.detectChanges();
      }
    });
  }

  loadGlobalSummary() {
    this.dashboardService.getGlobalSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[DEBUG] Error loading summary:', err);
        this.showErrorToast('Failed to load summary data.');
        this.cdr.detectChanges();
      }
    });
  }

  onProjectChange() {
    this.selectedMemberId = null;
    this.members = [];
    this.memberSummary = null;
    this.evaluationDetails = [];
    this.radarChartData.datasets[0].data = [0, 0, 0, 0, 0, 0];
    
    if (this.selectedProjectId) {
      this.dashboardService.getMembersByProject(this.selectedProjectId).subscribe({
        next: (data) => {
          this.members = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading members:', err);
          this.cdr.detectChanges();
        }
      });

      this.dashboardService.getProjectSummary(this.selectedProjectId).subscribe({
        next: (data) => {
          if (data.membersEvaluated > 0) {
            this.summary = {
              totalEvaluations: data.membersEvaluated,
              averageScore: this.calculateAverage(data.memberScores),
              ratingBreakdown: this.calculateRatingBreakdown(data.memberScores)
            };
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading project summary:', err);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loadGlobalSummary();
    }
  }

  onMemberChange() {
    this.memberSummary = null;
    this.evaluationDetails = [];
    this.radarChartData.datasets[0].data = [0, 0, 0, 0, 0, 0];

    if (this.selectedMemberId) {
      this.dashboardService.getMemberSummary(this.selectedMemberId).subscribe({
        next: (data) => {
          this.memberSummary = data;
          this.loadKraScores();
          this.loadEvaluationDetails();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading member summary:', err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadKraScores() {
    if (!this.selectedMemberId) return;

    this.dashboardService.getKraScoresByMember(this.selectedMemberId).subscribe({
      next: (kraScores) => {
        const orderedScores = [
          kraScores['Lead Discovery'] || 0,
          kraScores['Team Building'] || 0,
          kraScores['Communication'] || 0,
          kraScores['Prioritization'] || 0,
          kraScores['Problem Solving'] || 0,
          kraScores['Process Efficiency'] || 0
        ];
        this.radarChartData.datasets[0].data = orderedScores;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading KRA scores:', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadEvaluationDetails() {
    if (!this.memberSummary || !this.selectedMemberId) return;

    this.dashboardService.getEvaluationsByMember(this.selectedMemberId).subscribe({
      next: (evaluations) => {
        if (evaluations.length > 0) {
          const latestEvalId = evaluations[0].id;
          this.dashboardService.getEvaluationDetails(latestEvalId).subscribe({
            next: (details) => {
              this.evaluationDetails = details;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error loading details:', err);
              this.cdr.detectChanges();
            }
          });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading evaluations:', err);
        this.cdr.detectChanges();
      }
    });
  }

  private calculateAverage(memberScores: any[]): number {
    if (memberScores.length === 0) return 0;
    const total = memberScores.reduce((sum, m) => sum + parseFloat(m.latestScore), 0);
    return Math.round((total / memberScores.length) * 100) / 100;
  }

  private calculateRatingBreakdown(memberScores: any[]): { [key: string]: number } {
    const breakdown: { [key: string]: number } = { Outstanding: 0, Good: 0, Average: 0, Poor: 0 };
    memberScores.forEach(m => {
      const rating = m.latestRating;
      if (breakdown[rating] !== undefined) {
        breakdown[rating]++;
      }
    });
    return breakdown;
  }

  createProject() {
    if (!this.newProjectName.trim()) return;

    this.dashboardService.createProject(this.newProjectName).subscribe({
      next: (project) => {
        this.projects.push(project);
        this.newProjectName = '';
        this.showCreateProject = false;
        this.selectedProjectId = project.id;
        this.onProjectChange();
        this.showSuccessToast('Project created successfully!');
      },
      error: (err) => {
        console.error('[DEBUG] Error creating project:', err);
        this.showErrorToast('Failed to create project. Please try again.');
      }
    });
  }

  getRatingClass(rating: string): string {
    switch (rating) {
      case 'Outstanding': return 'rating-outstanding';
      case 'Good': return 'rating-good';
      case 'Average': return 'rating-average';
      case 'Poor': return 'rating-poor';
      default: return '';
    }
  }

  getKraIndex(label: string): number {
    const labels = ['Lead Discovery', 'Team Building', 'Communication', 'Prioritization', 'Problem Solving', 'Process Efficiency'];
    return labels.indexOf(label);
  }

  getKraScoresList(): { kra: string; value: number }[] {
    const labels = ['Lead Discovery', 'Team Building', 'Communication', 'Prioritization', 'Problem Solving', 'Process Efficiency'];
    const data = this.radarChartData.datasets[0].data;
    return labels.map((kra, i) => ({ kra, value: data[i] || 0 }));
  }

  goToBack() {
    this.goBack.emit();
  }

  onGoToKpiSetup() {
    this.goToKpiSetup.emit();
  }
}
