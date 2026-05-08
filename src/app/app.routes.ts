import { Routes } from '@angular/router';
import { AppLayoutComponent } from './core/layout/app-layout/app-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    // The base route will load the AppLayout Component
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        // When the path is empty, load the Dashboard component
        path: '',
        component: DashboardComponent
      }
      // Future features (clinics, doctors) will be added here as new children
    ], 
  },
  { path: '**', redirectTo: '' }
];
