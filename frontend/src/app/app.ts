import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './components/landing/landing.component';
import { PmEvaluationComponent } from './components/pm-evaluation/pm-evaluation.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KpiSetupComponent } from './components/kpi-setup/kpi-setup.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LandingComponent, PmEvaluationComponent, DashboardComponent, KpiSetupComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = signal('frontend');
  protected currentRole: 'PM' | 'PD' | null = null;
  protected showKpiSetup = false;

  onRoleSelected(role: 'PM' | 'PD') {
    this.currentRole = role;
    this.showKpiSetup = false;
  }

  goBack() {
    this.currentRole = null;
    this.showKpiSetup = false;
  }

  goToKpiSetup() {
    this.showKpiSetup = true;
  }
}
