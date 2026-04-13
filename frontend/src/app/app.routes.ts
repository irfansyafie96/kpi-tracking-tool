import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { PmEvaluationComponent } from './components/pm-evaluation/pm-evaluation.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KpiSetupComponent } from './components/kpi-setup/kpi-setup.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'pm', component: PmEvaluationComponent },
  { path: 'pd', component: DashboardComponent },
  { path: 'pd/kpi-setup', component: KpiSetupComponent },
  { path: '**', redirectTo: '' }
];