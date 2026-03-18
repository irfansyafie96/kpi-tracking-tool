import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KpiService, KpiMetric, KpiGroup } from '../../services/kpi.service';
import { HttpClient } from '@angular/common/http';
import { DashboardService } from '../dashboard/dashboard.service';
declare var bootstrap: any;

/**
 * KPI Setup Component for Project Director
 * 
 * This component allows PD to:
 * - View all KPIs grouped by KRA
 * - Add new KRAs and metrics
 * - Edit existing metrics (question, weight, rubric, file requirement)
 * - Delete metrics
 * - Validate that total weights = 100%
 * 
 * @author KPI System
 * @version 1.0
 */
@Component({
  selector: 'app-kpi-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kpi-setup.component.html',
  styleUrls: ['./kpi-setup.component.css']
})
export class KpiSetupComponent implements OnInit {
  // KPI data from API - grouped by KRA
  kpiData: { [kraName: string]: KpiGroup } = {};
  
  // For editing
  editingMetric: KpiMetric | null = null;
  isNewMetric = false;
  
  // For adding new KRA
  showAddKra = false;
  newKraName = '';
  newKraWeight = 0;
  
  // For adding new metric within KRA
  showAddMetric = false;
  addToKraName = '';
  newMetric: KpiMetric = this.getEmptyMetric();
  
  // UI state
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  
  // Weight validation
  totalKraWeight = 0;
  totalMetricWeight = 0;
  
  // For rubric editor
  rubricEntries: { key: number; value: string }[] = [];

  // For navigation
  @Output() goBack = new EventEmitter<void>();

  constructor(
    private kpiService: KpiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadKpis();
  }

  /**
   * Load all KPIs from API
   */
  loadKpis() {
    this.isLoading = true;
    this.kpiService.getMetricsGrouped().subscribe({
      next: (data) => {
        this.kpiData = data;
        this.calculateTotals();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[KPI Setup] Error loading KPIs:', err);
        this.showError('Failed to load KPIs. Please refresh the page.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Get all KRA names
   */
  getKraNames(): string[] {
    return Object.keys(this.kpiData);
  }

  /**
   * Get KRA weight
   */
  getKraWeight(kraName: string): number {
    return this.kpiData[kraName]?.kraWeight || 0;
  }

  /**
   * Get metrics for a KRA
   */
  getMetricsForKra(kraName: string): KpiMetric[] {
    return this.kpiData[kraName]?.metrics || [];
  }

  /**
   * Calculate total weights
   */
  calculateTotals() {
    // Calculate total KRA weight - sum all KRA weights (not unique)
    let totalKra = 0;
    for (const kraName in this.kpiData) {
      totalKra += this.kpiData[kraName].kraWeight;
    }
    this.totalKraWeight = totalKra;
    
    // Calculate total metric weight
    this.totalMetricWeight = 0;
    for (const kraName in this.kpiData) {
      for (const metric of this.kpiData[kraName].metrics) {
        this.totalMetricWeight += metric.metricWeight;
      }
    }
  }

  /**
   * Start editing a metric
   */
  editMetric(metric: KpiMetric) {
    this.editingMetric = { ...metric };
    this.isNewMetric = false;
    this.parseRubricForEdit(metric.rubricJson);
    this.showAddKra = false;
    this.showAddMetric = false;
  }

  /**
   * Start adding a new metric
   */
  startAddMetric(kraName: string) {
    this.addToKraName = kraName;
    this.newMetric = this.getEmptyMetric();
    this.newMetric.kraName = kraName;
    this.newMetric.kraWeight = this.getKraWeight(kraName);
    this.showAddMetric = true;
    this.showAddKra = false;
    this.editingMetric = null;
    this.rubricEntries = [
      { key: 1, value: '' },
      { key: 5, value: '' }
    ];
  }

  /**
   * Start adding a new KRA
   */
  startAddKra() {
    this.showAddKra = true;
    this.newKraName = '';
    this.newKraWeight = 0;
    this.showAddMetric = false;
    this.editingMetric = null;
  }

  /**
   * Cancel editing
   */
  cancelEdit() {
    this.editingMetric = null;
    this.isNewMetric = false;
    this.showAddMetric = false;
    this.showAddKra = false;
    this.rubricEntries = [];
  }

  /**
   * Save edited metric
   */
  saveMetric() {
    if (!this.editingMetric) return;
    
    // Validate
    if (!this.editingMetric.kraName || !this.editingMetric.metricName) {
      this.showError('KRA name and metric name are required');
      return;
    }

    // Build rubric JSON
    this.editingMetric.rubricJson = this.buildRubricJson();
    
    this.isSaving = true;
    
    if (this.editingMetric.id) {
      // Update existing
      this.kpiService.updateMetric(this.editingMetric.id, this.editingMetric).subscribe({
        next: () => {
          this.showSuccess('Metric updated successfully');
          this.loadKpis();
          this.cancelEdit();
          this.isSaving = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[KPI Setup] Error updating metric:', err);
          this.showError(err.error?.error || 'Failed to update metric');
          this.isSaving = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  /**
   * Save new metric
   */
  saveNewMetric() {
    if (!this.newMetric.kraName || !this.newMetric.metricName) {
      this.showError('KRA name and metric name are required');
      return;
    }

    // Set display order
    const existingMetrics = this.getMetricsForKra(this.newMetric.kraName);
    this.newMetric.displayOrder = existingMetrics.length + 1;
    
    // Build rubric JSON
    this.newMetric.rubricJson = this.buildRubricJsonForNew();
    
    this.isSaving = true;
    
    this.kpiService.createMetric(this.newMetric).subscribe({
      next: () => {
        this.showSuccess('Metric created successfully');
        this.loadKpis();
        this.cancelEdit();
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[KPI Setup] Error creating metric:', err);
        this.showError(err.error?.error || 'Failed to create metric');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Save new KRA
   */
  saveNewKra() {
    if (!this.newKraName.trim()) {
      this.showError('KRA name is required');
      return;
    }

    if (this.newKraWeight <= 0) {
      this.showError('KRA weight must be greater than 0');
      return;
    }

    // Create first metric for this KRA
    const metric: KpiMetric = {
      kraName: this.newKraName.trim(),
      kraWeight: this.newKraWeight,
      metricName: 'New Metric',
      evidence: 'Evidence',
      metricWeight: this.newKraWeight,  // Default to full KRA weight
      rubricJson: '{"1": "1% - Poor", "5": "5% - Excellent"}',
      requiresFile: false,
      displayOrder: 1
    };

    this.isSaving = true;
    
    this.kpiService.createMetric(metric).subscribe({
      next: () => {
        this.showSuccess('KRA created successfully');
        this.loadKpis();
        this.cancelEdit();
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[KPI Setup] Error creating KRA:', err);
        this.showError(err.error?.error || 'Failed to create KRA');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Delete a metric
   */
  deleteMetric(metric: KpiMetric) {
    if (!metric.id || !confirm(`Delete metric "${metric.metricName}"?`)) {
      return;
    }

    this.kpiService.deleteMetric(metric.id).subscribe({
      next: () => {
        this.showSuccess('Metric deleted successfully');
        this.loadKpis();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[KPI Setup] Error deleting metric:', err);
        this.showError('Failed to delete metric');
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Validate weights
   */
  validateWeights() {
    this.kpiService.validateWeights().subscribe({
      next: (response) => {
        if (response.valid) {
          this.showSuccess(response.message);
        } else {
          this.showError(response.message);
        }
      },
      error: (err) => {
        console.error('[KPI Setup] Error validating weights:', err);
        this.showError('Failed to validate weights');
      }
    });
  }

  /**
   * Parse rubric JSON for editing
   */
  private parseRubricForEdit(rubricJson: string) {
    this.rubricEntries = [];
    try {
      const rubric = JSON.parse(rubricJson);
      for (const key in rubric) {
        this.rubricEntries.push({
          key: parseInt(key),
          value: rubric[key]
        });
      }
      // Sort by key
      this.rubricEntries.sort((a, b) => a.key - b.key);
    } catch (e) {
      this.rubricEntries = [{ key: 1, value: '' }, { key: 5, value: '' }];
    }
  }

  /**
   * Build rubric JSON from entries (for editing)
   */
  private buildRubricJson(): string {
    const rubric: { [key: number]: string } = {};
    for (const entry of this.rubricEntries) {
      if (entry.value.trim()) {
        rubric[entry.key] = entry.value;
      }
    }
    return JSON.stringify(rubric);
  }

  /**
   * Build rubric JSON for new metric
   */
  private buildRubricJsonForNew(): string {
    return '{"1": "1% - Poor", "5": "5% - Excellent"}';
  }

  /**
   * Add rubric entry
   */
  addRubricEntry() {
    const maxKey = this.rubricEntries.length > 0 
      ? Math.max(...this.rubricEntries.map(e => e.key)) 
      : 0;
    this.rubricEntries.push({ key: maxKey + 1, value: '' });
    this.rubricEntries.sort((a, b) => a.key - b.key);
  }

  /**
   * Remove rubric entry
   */
  removeRubricEntry(index: number) {
    this.rubricEntries.splice(index, 1);
  }

  /**
   * Format rubric JSON to readable string for display
   * Converts: {"1": "1% - Poor", "5": "5% - Excellent"}
   * To: "1% - Poor" on one line, "5% - Excellent" on next line, etc.
   */
  formatRubric(rubricJson: string): string {
    if (!rubricJson) return '';
    
    try {
      const rubric = JSON.parse(rubricJson);
      const entries: string[] = [];
      
      // Sort keys numerically and build string
      const keys = Object.keys(rubric).sort((a, b) => parseInt(a) - parseInt(b));
      for (const key of keys) {
        // Use the value as-is since it already contains the percentage
        entries.push(rubric[key]);
      }
      
      // Join with line breaks for stacked display
      return entries.join('\n');
    } catch (e) {
      return rubricJson;
    }
  }

  /**
   * Get empty metric template
   */
  private getEmptyMetric(): KpiMetric {
    return {
      kraName: '',
      kraWeight: 0,
      metricName: '',
      evidence: '',
      metricWeight: 1,
      rubricJson: '{}',
      requiresFile: false,
      displayOrder: 0
    };
  }

  // ============================================
  // Toast/Message methods
  // ============================================

  showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 5000);
  }

  showSuccessToast(message: string) {
    const toastEl = document.getElementById('kpiSuccessToast');
    const toastBody = document.getElementById('kpiSuccessToastBody');
    if (toastEl && toastBody) {
      toastBody.textContent = message;
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  showErrorToast(message: string) {
    const toastEl = document.getElementById('kpiErrorToast');
    const toastBody = document.getElementById('kpiErrorToastBody');
    if (toastEl && toastBody) {
      toastBody.textContent = message;
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  onGoBack() {
    this.goBack.emit();
  }
}
