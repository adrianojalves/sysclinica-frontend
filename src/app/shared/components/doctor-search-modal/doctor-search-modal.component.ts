import { Component, inject, OnInit, signal } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DoctorService } from '../../../core/services/medical/doctor.service';
import { Doctor } from '../../../core/models/medical/doctor.model';
import { SHARED_UI_IMPORTS } from '../../imports/shared-ui.imports';

@Component({
  selector: 'app-doctor-search-modal',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './doctor-search-modal.component.html'
})
export class DoctorSearchModalComponent implements OnInit {
  private readonly doctorService = inject(DoctorService);
  private readonly ref = inject(DynamicDialogRef);

  public doctors = signal<Doctor[]>([]);
  public loading = signal<boolean>(false);
  public searchTerm = signal<string>('');

  ngOnInit(): void {
    this.search();
  }

  public search(): void {
    this.loading.set(true);
    this.doctorService.findFiltered(0, 50, this.searchTerm()).subscribe({
      next: (response) => {
        this.doctors.set(response.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  public selectDoctor(doctor: Doctor): void {
    this.ref.close(doctor);
  }
}