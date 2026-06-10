import { Component, inject, OnInit, signal } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProcedureFilter } from '../../../core/models/medical/procedure-filter.model';
import { SHARED_UI_IMPORTS } from '../../imports/shared-ui.imports';
import { MedicalProcedureService } from '../../../core/services/medical/procedure.service';
import { MedicalProcedure } from '../../../core/models/medical/procedure.model';
import { PROCEDURE_TYPE_FILTER_OPTIONS } from '../../constants/ui.constants';

@Component({
  selector: 'app-procedure-search-modal',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './procedure-search-modal.component.html'
})
export class ProcedureSearchModalComponent implements OnInit {
  private readonly procedureService = inject(MedicalProcedureService);
  private readonly ref = inject(DynamicDialogRef);

  public procedures = signal<MedicalProcedure[]>([]);
  public loading = signal<boolean>(false);
  public readonly typeOptions = PROCEDURE_TYPE_FILTER_OPTIONS;

  // Initializing filter with status true for search modal
  public filter: ProcedureFilter = {
    name: '',
    type: undefined,
    status: true
  };

  ngOnInit(): void {
    this.search();
  }

  public search(): void {
    this.loading.set(true);
    this.procedureService.findFilteredNew(0, 50, this.filter).subscribe({
      next: (response) => {
        this.procedures.set(response.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  public selectProcedure(item: MedicalProcedure): void {
    this.ref.close(item);
  }
}