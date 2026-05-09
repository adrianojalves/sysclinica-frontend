import { Component, inject, OnInit, signal } from '@angular/core';
import { SHARED_UI_IMPORTS } from '../../../../shared/imports/shared-ui.imports';
import { MedicalProcedureService } from '../../../../core/services/medical/procedure.service';
import { MedicalProcedure, ProcedureType } from '../../../../core/models/medical/procedure.model';

@Component({
  selector: 'app-procedure-list',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './procedure-list.component.html'
})
export class ProcedureListComponent implements OnInit {
  private readonly procedureService = inject(MedicalProcedureService);

  // Table Data
  public procedures = signal<MedicalProcedure[]>([]);
  public totalRecords = signal<number>(0);
  public loading = this.procedureService.loading;

  // Filters
  public filterName = signal<string>('');
  public filterType = signal<ProcedureType | undefined>(undefined);
  
  public typeOptions = [
    { label: 'Todos', value: undefined },
    { label: 'Exame', value: ProcedureType.EXAME },
    { label: 'Consulta', value: ProcedureType.CONSULTA }
  ];

  ngOnInit(): void {
    this.loadProcedures();
  }

  public loadProcedures(event?: any): void {
    const page = event ? event.first / event.rows : 0;
    const size = event ? event.rows : 10;

    this.procedureService.findFiltered(page, size, this.filterName(), this.filterType())
      .subscribe(response => {
        this.procedures.set(response.content);
        this.totalRecords.set(response.totalElements);
      });
  }

  public onFilter(): void {
    this.loadProcedures();
  }
}