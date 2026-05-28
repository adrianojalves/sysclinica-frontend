import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { BaseCrudService } from '../base-crud.service';
import { ClinicDoctorProcedure, ClinicDoctorProcedureFilter } from '../../models/medical/clinic-procedure.model';

@Injectable({
  providedIn: 'root'
})
export class ClinicProcedureService extends BaseCrudService<ClinicDoctorProcedure, number> {
  protected readonly endpoint = 'clinica/clinic-procedures';

  /**
   * List procedures by clinic with pagination
   */
  public list(filter: ClinicDoctorProcedureFilter, page: number = 0, size: number = 50): Observable<any> {
    this.loading.set(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.clinicId) params = params.set('clinicId', filter.clinicId.toString());
    if (filter.clinicName) params = params.set('clinicName', filter.clinicName);
    if (filter.doctorId) params = params.set('doctorId', filter.doctorId.toString());
    if (filter.doctorName) params = params.set('doctorName', filter.doctorName);
    if (filter.medicalProcedureId) params = params.set('medicalProcedureId', filter.medicalProcedureId.toString());
    if (filter.procedureName) params = params.set('procedureName', filter.procedureName);

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      finalize(() => this.loading.set(false))
    );
  }
}