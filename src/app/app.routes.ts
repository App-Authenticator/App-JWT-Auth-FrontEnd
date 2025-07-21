import { Routes } from '@angular/router';
import { RegistroComponent } from './pages/registro/registro.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MfaSetupComponent } from './shared/components/mfa-setup/mfa-setup.component';


export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', component: RegistroComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'mfa-setup', component: MfaSetupComponent },
  { path: '**', redirectTo: '/auth' }
];
