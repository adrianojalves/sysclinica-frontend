import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ClinicService } from '../../../../core/services/medical/clinic.service';
import { Clinic, ClinicFilter } from '../../../../core/models/medical/clinic.model';
import { SHARED_UI_IMPORTS } from '../../../../shared/imports/shared-ui.imports';
import { MessageService } from '../../../../core/services/message.service';
import { STATUS_OPTIONS } from '../../../../shared/constants/ui.constants';

@Component({
  selector: 'app-clinic-list',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './clinic-list.component.html'
})
export class ClinicListComponent implements OnInit {
  private readonly clinicService = inject(ClinicService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  public clinics = signal<Clinic[]>([]);
  public totalRecords = signal<number>(0);
  public loading = signal<boolean>(false);
  
  public filter: ClinicFilter = { name: '', cnpj: '' };
  public readonly statusOptions = STATUS_OPTIONS;

  ngOnInit(): void {
    this.loadClinics();
  }

  public loadClinics(page: number = 0, size: number = 10): void {
    this.loading.set(true);
    this.clinicService.listAll(page, size, this.filter).subscribe({
      next: (response) => {
        this.clinics.set(response.content);
        this.totalRecords.set(response.page.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.show('error', 'Erro', 'Falha ao carregar clínicas.');
      }
    });
  }

  public onStatusChange(clinic: Clinic, newStatus: boolean): void {
    this.clinicService.updateStatus(clinic.id, newStatus).subscribe({
      next: () => {
        this.messageService.show('success', 'Sucesso', 'Status atualizado!');
      },
      error: () => {
        // Revert UI if server fails
        clinic.active = !newStatus;
        this.messageService.show('error', 'Erro', 'Não foi possível atualizar o status.');
      }
    });
  }

  public onPageChange(event: any): void {
    const page = event.first ? Math.floor(event.first / (event.rows || 10)) : 0;
    const size = event.rows || 10;
    this.loadClinics(page, size);
  }

  public goToNew(): void {
    this.router.navigate(['/clinics/new']);
  }

  public editClinic(id: number): void {
    this.router.navigate(['/clinics', id]);
  }
}