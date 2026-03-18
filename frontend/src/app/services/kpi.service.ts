import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface representing a KPI Metric from the API
 */
export interface KpiMetric {
  id?: number;  // Optional for new metrics
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
export interface KpiGroup {
  kraWeight: number;
  metrics: KpiMetric[];
}

/**
 * KPI Service for managing KPI metrics via API
 * 
 * This service provides methods to:
 * - Get all KPIs (flat list or grouped by KRA)
 * - Get single KPI by ID
 * - Create, update, delete KPIs
 * - Validate weight totals
 * 
 * @author KPI System
 * @version 1.0
 */
@Injectable({
  providedIn: 'root'
})
export class KpiService {
  private apiUrl = 'http://localhost:8080/api/kpi-metrics';

  constructor(private http: HttpClient) {}

  /**
   * Get all KPI metrics as a flat list
   * Ordered by display_order
   */
  getAllMetrics(): Observable<KpiMetric[]> {
    return this.http.get<KpiMetric[]>(this.apiUrl);
  }

  /**
   * Get all metrics grouped by KRA
   * This is the main method for the evaluation form
   */
  getMetricsGrouped(): Observable<{ [kraName: string]: KpiGroup }> {
    return this.http.get<{ [kraName: string]: KpiGroup }>(`${this.apiUrl}/grouped`);
  }

  /**
   * Get a single metric by ID
   */
  getMetricById(id: number): Observable<KpiMetric> {
    return this.http.get<KpiMetric>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new KPI metric
   */
  createMetric(metric: KpiMetric): Observable<KpiMetric> {
    return this.http.post<KpiMetric>(this.apiUrl, metric);
  }

  /**
   * Update an existing KPI metric
   */
  updateMetric(id: number, metric: KpiMetric): Observable<KpiMetric> {
    return this.http.put<KpiMetric>(`${this.apiUrl}/${id}`, metric);
  }

  /**
   * Delete a KPI metric
   */
  deleteMetric(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Validate that KRA and metric weights total 100%
   */
  validateWeights(): Observable<{ valid: boolean; message: string }> {
    return this.http.get<{ valid: boolean; message: string }>(`${this.apiUrl}/validate`);
  }

  /**
   * Check if KPI data exists
   */
  getStatus(): Observable<{ hasData: boolean; count: number }> {
    return this.http.get<{ hasData: boolean; count: number }>(`${this.apiUrl}/status`);
  }
}
