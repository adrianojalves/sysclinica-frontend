import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../base-crud.service';
import { ClinicDoctorProcedure, ClinicDoctorProcedureFilter } from '../../models/medical/clinic-procedure.model';
import { Page } from '../../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class ClinicProcedureService extends BaseCrudService<ClinicDoctorProcedure, number> {
  protected readonly endpoint = 'clinica/clinic-procedures';

  /**
   * List procedures by clinic with pagination
   */
  public list(filter: ClinicDoctorProcedureFilter, page: number = 0, size: number = 100): Observable<Page<ClinicDoctorProcedure>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.clinicId) params = params.set('clinicId', filter.clinicId.toString());

    return this.http.get<Page<ClinicDoctorProcedure>>(this.apiUrl, { params });
  }
}