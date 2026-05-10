import { Component, inject, OnInit, signal } from '@angular/core';
import { SHARED_UI_IMPORTS } from '../../../../shared/imports/shared-ui.imports';
import { DoctorService } from '../../../../core/services/medical/doctor.service';
import { MessageService } from '../../../../core/services/message.service';
import { Doctor } from '../../../../core/models/medical/doctor.model';
import { STATUS_OPTIONS } from '../../../../shared/constants/ui.constants';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './doctor-list.component.html'
})
export class DoctorListComponent implements OnInit {
  private readonly doctorService = inject(DoctorService);
  private readonly messageService = inject(MessageService);

  public doctors = signal<Doctor[]>([]);
  public totalRecords = signal<number>(0);
  public loading = this.doctorService.loading;
  public filterName = signal<string>('');
  
  public readonly statusOptions = STATUS_OPTIONS;

  ngOnInit(): void {
    this.loadDoctors();
  }

  public loadDoctors(event?: any): void {
    const page = event ? event.first / event.rows : 0;
    const size = event ? event.rows : 10;

    this.doctorService.findFiltered(page, size, this.filterName())
      .subscribe(response => {
        this.doctors.set(response.content);
        this.totalRecords.set(response.totalElements);
      });
  }

  // Directly call the PATCH endpoint when the status select changes
  public onStatusChange(doctor: Doctor): void {
    this.doctorService.changeStatus(doctor.id, doctor.status).subscribe({
      next: () => {
        this.messageService.show('success', 'Sucesso', `Status do médico ${doctor.name} atualizado.`);
      },
      error: () => {
        // Rollback UI state on error
        doctor.status = !doctor.status;
        this.messageService.show('error', 'Erro', 'Não foi possível alterar o status.');
      }
    });
  }
}