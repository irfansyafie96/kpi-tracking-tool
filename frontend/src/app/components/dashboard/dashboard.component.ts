import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService, Project, ProjectMember, DashboardSummary, MemberSummary, EvaluationDetail } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
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

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadProjects();
    this.loadGlobalSummary();
  }

  loadProjects() {
    this.dashboardService.getProjects().subscribe({
      next: (data) => this.projects = data,
      error: (err) => console.error('Error loading projects:', err)
    });
  }

  loadGlobalSummary() {
    this.dashboardService.getGlobalSummary().subscribe({
      next: (data) => this.summary = data,
      error: (err) => console.error('Error loading summary:', err)
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
        next: (data) => this.members = data,
        error: (err) => console.error('Error loading members:', err)
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
        },
        error: (err) => console.error('Error loading project summary:', err)
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
        },
        error: (err) => console.error('Error loading member summary:', err)
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
      },
      error: (err) => console.error('Error loading KRA scores:', err)
    });
  }

  loadEvaluationDetails() {
    if (!this.memberSummary || !this.selectedMemberId) return;

    this.dashboardService.getEvaluationsByMember(this.selectedMemberId).subscribe({
      next: (evaluations) => {
        if (evaluations.length > 0) {
          const latestEvalId = evaluations[0].id;
          this.dashboardService.getEvaluationDetails(latestEvalId).subscribe({
            next: (details) => this.evaluationDetails = details,
            error: (err) => console.error('Error loading details:', err)
          });
        }
      },
      error: (err) => console.error('Error loading evaluations:', err)
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
      },
      error: (err) => console.error('Error creating project:', err)
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
}
