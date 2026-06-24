import { Component, inject, OnInit, signal } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ClinicService } from '../../../core/services/medical/clinic.service';
import { Clinic } from '../../../core/models/medical/clinic.model';
import { SHARED_UI_IMPORTS } from '../../imports/shared-ui.imports';

@Component({
  selector: 'app-clinic-search-modal',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './clinic-search-modal.component.html'
})
export class ClinicSearchModalComponent implements OnInit {
  private readonly clinicService = inject(ClinicService);
  private readonly ref = inject(DynamicDialogRef);

  public clinics = signal<Clinic[]>([]);
  public loading = signal<boolean>(false);
  public searchTerm = signal<string>('');

  ngOnInit(): void {
    this.search();
  }

  public search(): void {
    this.loading.set(true);
    this.clinicService.listAll(0, 50, { name: this.searchTerm() }).subscribe({
      next: (response) => {
        this.clinics.set(response.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  public selectClinic(clinic: Clinic): void {
    this.ref.close(clinic);
  }
}
