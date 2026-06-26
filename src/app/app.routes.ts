import { Routes } from '@angular/router';
import { AppLayoutComponent } from './core/layout/app-layout/app-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { UserFormComponent } from './features/users/user-form/user-form.component';
import { roleGuard } from './core/guards/role.guard';
import { ProcedureListComponent } from './features/medical/procedures/procedure-list/procedure-list.component';
import { ProcedureFormComponent } from './features/medical/procedures/procedure-form/procedure-form.component';
import { DoctorListComponent } from './features/medical/doctors/doctor-list/doctor-list.component';
import { DoctorFormComponent } from './features/medical/doctors/doctor-form/doctor-form.component';
import { CompanyFormComponent } from './features/company/company-form/company-form.component';
import { ClinicListComponent } from './features/medical/clinics/clinic-list/clinic-list.component';
import { ClinicFormComponent } from './features/medical/clinics/clinic-form/clinic-form.component';
import { ClientListComponent } from './features/clients/client-list/client-list.component';
import { ClientFormComponent } from './features/clients/client-form/client-form.component';
import { AtendimentoFormComponent } from './features/atendimento/atendimento-form/atendimento-form.component';
import { ImportarTabelaComponent } from './features/administracao/importar-tabela/importar-tabela.component';
import { AtendimentoReportComponent } from './features/relatorios/atendimento-report/atendimento-report.component';
import { RepasseReportComponent } from './features/relatorios/repasse-report/repasse-report.component';
import { AbcReportComponent } from './features/relatorios/abc-report/abc-report.component';
import { DesempenhoReportComponent } from './features/relatorios/desempenho-report/desempenho-report.component';
import { HistoricoReportComponent } from './features/relatorios/historico-report/historico-report.component';

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
      },
      { 
        path: 'procedures', 
        component: ProcedureListComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS'] }
      },
      { 
        path: 'procedures/new', 
        component: ProcedureFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS'] }
      },
      { 
        path: 'procedures/:id/edit', 
        component: ProcedureFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS'] }
      },
      { 
        path: 'doctors', 
        component: DoctorListComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS'] }
      },
      { 
        path: 'doctors/new', 
        component: DoctorFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS'] }
      },
      { 
        path: 'doctors/:id/edit', 
        component: DoctorFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS'] }
      },
      { 
        path: 'company', 
        component: CompanyFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS'] }
      },
      { 
        path: 'clinics', 
        component: ClinicListComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS'] }
      },
      { 
        path: 'clinics/new', 
        component: ClinicFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS'] }
      },
      { 
        path: 'clinics/:id', 
        component: ClinicFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS'] }
      },
      { 
        path: 'clients', 
        component: ClientListComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS'] }
      },
      { 
        path: 'clients/new', 
        component: ClientFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS', 'ROLE_ATENDIMENTO'] }
      },
      {
        path: 'clients/:id/edit',
        component: ClientFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS'] }
      },
      {
        path: 'atendimento',
        component: AtendimentoFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CADASTROS', 'ROLE_ATENDIMENTO'] }
      },
      {
        path: 'relatorios/atendimentos',
        component: AtendimentoReportComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_RELATORIOS'] }
      },
      {
        path: 'relatorios/repasse',
        component: RepasseReportComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_RELATORIOS'] }
      },
      {
        path: 'relatorios/abc',
        component: AbcReportComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_RELATORIOS'] }
      },
      {
        path: 'relatorios/desempenho',
        component: DesempenhoReportComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_RELATORIOS'] }
      },
      {
        path: 'relatorios/historico-paciente',
        component: HistoricoReportComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_RELATORIOS'] }
      },
      {
        path: 'administracao',
        component: ImportarTabelaComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
    ],
  },
  { path: '**', redirectTo: '' }
];
