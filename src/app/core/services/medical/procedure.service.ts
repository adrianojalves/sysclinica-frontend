import { Injectable } from '@angular/core';
import { BaseCrudService } from '../base-crud.service';
import { MedicalProcedure, ProcedureType } from '../../models/medical/procedure.model';
import { Page } from '../../models/page.model';
import { HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';

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
}