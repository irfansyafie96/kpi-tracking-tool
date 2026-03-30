import { Component, OnInit, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
declare var bootstrap: any;

/**
 * Interface representing a KPI Metric from the API
 * The API returns metrics grouped by KRA
 */
interface KpiMetric {
  id: number;
  kraName: string;
  kraWeight: number;
  metricName: string;
  evidence: string;
  metricWeight: number;
  rubricJson: string;
  requiresFile: boolean;
  displayOrder: number;
}

/**
 * Interface for KRA group from API
 * The API returns: { "Lead Discovery": { kraWeight: 20, metrics: [...] }, ... }
 */
interface KpiGroup {
  kraWeight: number;
  metrics: KpiMetric[];
}

interface Project {
  id: number;
  projectName: string;
}

interface ProjectMember {
  id: number;
  memberName: string;
  role: 'BA' | 'QA';
}

/**
 * Interface for storing metric scores during evaluation
 * This is what gets sent to the backend when submitting
 */
interface MetricScore {
  metricId: number | null;  // Reference to kpi_metrics.id (for snapshot)
  kraName: string;
  metricName: string;
  evidenceReviewed: string;
  percentageScore: number | null;
  evidenceRemarks: string;
  requiresFile: boolean;     // Whether this metric requires file upload
  filePath: string | null;   // Path to uploaded file (if any)
}

@Component({
  selector: 'app-pm-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pm-evaluation.component.html',
  styleUrls: ['./pm-evaluation.component.css']
})
export class PmEvaluationComponent implements OnInit, AfterViewInit {
  // KPI data from API - grouped by KRA
  kpiData: { [kraName: string]: KpiGroup } = {};

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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // First load KPIs from API, then load projects
    this.loadKpis();
  }

  /**
   * Load KPI metrics from the backend API
   * This fetches the customizable KPI framework from the database
   */
  loadKpis() {
    this.http.get<{ [kraName: string]: KpiGroup }>('http://localhost:8080/api/kpi-metrics/grouped')
      .subscribe({
        next: (data) => {
          this.kpiData = data;
          console.log('[PM] KPIs loaded from API:', Object.keys(data).length, 'KRAs');
          this.initMetrics();  // Initialize metrics after KPIs are loaded
          this.loadProjects();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[PM] Error loading KPIs:', err);
          this.showErrorToast('Failed to load KPI metrics. Please refresh the page.');
          this.cdr.detectChanges();
        }
      });
  }

  ngAfterViewInit() {
    // Initialize toast elements
  }

  showSuccessToast(message: string) {
    const toastEl = document.getElementById('pmSuccessToast');
    const toastBody = document.getElementById('pmSuccessToastBody');
    if (toastEl && toastBody) {
      toastBody.textContent = message;
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  showErrorToast(message: string) {
    const toastEl = document.getElementById('pmErrorToast');
    const toastBody = document.getElementById('pmErrorToastBody');
    if (toastEl && toastBody) {
      toastBody.textContent = message;
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  /**
   * Initialize the metrics array based on KPIs from API
   * This creates empty metric scores that PM will fill in
   */
  initMetrics() {
    this.metrics = [];

    // Loop through each KRA in the KPI data
    for (const kraName in this.kpiData) {
      const kraGroup = this.kpiData[kraName];

      // Loop through each metric in the KRA
      for (const metric of kraGroup.metrics) {
        this.metrics.push({
          metricId: metric.id,  // Store metric ID for snapshot
          kraName: metric.kraName,
          metricName: metric.metricName,
          evidenceReviewed: metric.evidence,
          percentageScore: null,
          evidenceRemarks: '',
          requiresFile: metric.requiresFile || false,  // File upload requirement
          filePath: null  // Will store uploaded file path
        });
      }
    }

    console.log('[PM] Metrics initialized:', this.metrics.length, 'metrics');
  }

  loadProjects() {
    this.http.get<Project[]>('http://localhost:8080/api/projects')
      .subscribe({
        next: (data) => {
          this.projects = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[PM DEBUG] Error loading projects:', err);
          this.showErrorToast('Failed to load projects. Please refresh the page.');
          this.cdr.detectChanges();
        }
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
          next: (data) => {
            this.members = data;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('[PM DEBUG] Error loading members:', err);
            this.showErrorToast('Failed to load team members.');
            this.cdr.detectChanges();
          }
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
        this.showSuccessToast('Team member added successfully!');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[PM DEBUG] Error adding member:', err);
        this.showErrorToast('Failed to add team member.');
        this.cdr.detectChanges();
      }
    });
  }

  get completedCount(): number {
    return this.metrics.filter(m => m.percentageScore !== null).length;
  }

  /**
   * Check if all required files are uploaded
   * Returns true if all metrics that require file have a file uploaded
   */
  get allRequiredFilesUploaded(): boolean {
    for (const metric of this.metrics) {
      if (metric.requiresFile && !metric.filePath) {
        return false;
      }
    }
    return true;
  }

  get isFormValid(): boolean {
    return (
      this.selectedProjectId !== null &&
      this.selectedMemberId !== null &&
      this.evaluatorName.trim().length > 0 &&
      this.completedCount === this.metrics.length &&
      this.allRequiredFilesUploaded
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
          this.showSuccessToast('Evaluation submitted successfully!');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to submit evaluation. Please try again.';
          console.error('[PM DEBUG] Error submitting evaluation:', err);
          this.showErrorToast('Failed to submit evaluation. Please try again.');
          this.cdr.detectChanges();
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
    return metric?.percentageScore ?? null;
  }

  setScore(kraName: string, metricName: string, score: number) {
    const metric = this.metrics.find(m => m.kraName === kraName && m.metricName === metricName);
    if (metric) {
      metric.percentageScore = score;
    }
  }

  onPercentageChange(kraName: string, metricName: string, value: number) {
    const metric = this.metrics.find(m => m.kraName === kraName && m.metricName === metricName);
    if (metric) {
      metric.percentageScore = (value === null || isNaN(value)) ? null : value;
    }
  }

  getMetricRef(kraName: string, metricName: string): MetricScore {
    return this.metrics.find(m => m.kraName === kraName && m.metricName === metricName)!;
  }

  /**
   * Get rubric text for a specific metric based on current score
   * Rubric is stored as JSON in the API, so we parse it
   */
  getRubricText(kraName: string, metricName: string): string {
    const kraGroup = this.kpiData[kraName];
    if (!kraGroup) return '';

    const metric = kraGroup.metrics.find(m => m.metricName === metricName);
    if (!metric) return '';

    const score = this.getMetricScore(kraName, metricName);
    if (score === null) return 'Enter a percentage to see rubric';

    // Parse rubric JSON: {"1": "text", "5": "text"}
    try {
      const rubric = JSON.parse(metric.rubricJson);
      return rubric[score] || '';
    } catch (e) {
      return '';
    }
  }

  /**
   * Get maximum possible score for a metric
   * This is the metric_weight from the API
   */
  getMaxScore(metricName: string): number {
    for (const kraName in this.kpiData) {
      const kraGroup = this.kpiData[kraName];
      const metric = kraGroup.metrics.find(m => m.metricName === metricName);
      if (metric) {
        return metric.metricWeight;
      }
    }
    return 5;  // Default fallback
  }

  /**
   * Get the requiresFile flag for a metric
   * Used in template to show file upload input
   */
  requiresFile(kraName: string, metricName: string): boolean {
    const kraGroup = this.kpiData[kraName];
    if (!kraGroup) return false;
    const metric = kraGroup.metrics.find(m => m.metricName === metricName);
    return metric?.requiresFile || false;
  }

  /**
   * Get all KRA names from the KPI data
   * Used in template to loop through KRAs
   */
  getKraNames(): string[] {
    return Object.keys(this.kpiData);
  }

  /**
   * Get KRA weight for a specific KRA
   */
  getKraWeight(kraName: string): number {
    return this.kpiData[kraName]?.kraWeight || 0;
  }

  /**
   * Get all metrics for a specific KRA
   */
  getMetricsForKra(kraName: string): KpiMetric[] {
    return this.kpiData[kraName]?.metrics || [];
  }

  /**
   * Upload a file for a specific metric
   * Called when user selects a file for a metric that requires file upload
   */
  onFileSelected(event: any, kraName: string, metricName: string) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('[PM] File selected for', metricName, ':', file.name);

    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);

    // Upload to backend
    this.http.post<any>('http://localhost:8080/api/uploads', formData)
      .subscribe({
        next: (response) => {
          console.log('[PM] File uploaded successfully:', response);

          // Update the metric with the file path
          const metric = this.metrics.find(m => m.kraName === kraName && m.metricName === metricName);
          if (metric) {
            metric.filePath = response.filePath;
            console.log('[PM] File path saved to metric:', metric.filePath);
          }

          this.showSuccessToast('File uploaded successfully!');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[PM] Error uploading file:', err);
          this.showErrorToast('Failed to upload file. Please try again.');
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Get the file name from a file path
   * Used to display the uploaded file name
   */
  getFileName(filePath: string | null): string {
    if (!filePath) return '';
    return filePath.split('/').pop() || '';
  }
}
