import { Injectable } from '@angular/core';
import { BaseCrudService } from '../base-crud.service';
import { MedicalProcedure, ProcedureType } from '../../models/medical/procedure.model';
import { Page } from '../../models/page.model';
import { HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { ProcedureFilter } from '../../models/medical/procedure-filter.model';

@Injectable({
  providedIn: 'root'
})
export class MedicalProcedureService extends BaseCrudService<MedicalProcedure, number> {
  protected readonly endpoint = 'clinica/procedures';

  /**
   * Fetches paginated procedures with optional filters for name and type.
   */
  findFiltered(page: number, size: number, name?: string, type?: ProcedureType): Observable<Page<MedicalProcedure>> {
    this.loading.set(true);
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (name) params = params.set('name', name);
    if (type) params = params.set('type', type);

    return this.http.get<Page<MedicalProcedure>>(this.apiUrl, { params }).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  findFilteredNew(page: number, size: number, filter: ProcedureFilter): Observable<Page<MedicalProcedure>> {
  this.loading.set(true);
  
  let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  if (filter.name) params = params.set('name', filter.name);
  if (filter.type) params = params.set('type', filter.type.toString());
  
  // Only send status if it is explicitly true or false (not null/undefined)
  if (filter.status !== undefined && filter.status !== null) {
    params = params.set('status', filter.status.toString());
  }

  return this.http.get<Page<MedicalProcedure>>(this.apiUrl, { params }).pipe(
    finalize(() => this.loading.set(false))
  );
}
}