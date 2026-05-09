import { Routes } from '@angular/router';
import { AppLayoutComponent } from './core/layout/app-layout/app-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { UserFormComponent } from './features/users/user-form/user-form.component';
import { roleGuard } from './core/guards/role.guard';

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
      },
      { 
        path: 'users', 
        component: UserListComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      { 
        path: 'users/new', 
        component: UserFormComponent,
        canActivate: [roleGuard ],
        data: { roles: ['ROLE_ADMIN'] }
      },
      { 
        path: 'users/:id/edit',
        component: UserFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      }
    ], 
  },
  { path: '**', redirectTo: '' }
];
