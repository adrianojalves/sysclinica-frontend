import { Injectable } from '@angular/core';
import { BaseCrudService } from '../base-crud.service';
import { Doctor } from '../../models/medical/doctor.model';
import { Observable, finalize } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Page } from '../../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService extends BaseCrudService<Doctor, number> {
  protected readonly endpoint = 'clinica/doctors';

  // Fetch doctors with pagination and name filter
  findFiltered(page: number, size: number, name?: string): Observable<Page<Doctor>> {
    this.loading.set(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (name) params = params.set('name', name);

    return this.http.get<Page<Doctor>>(this.apiUrl, { params }).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  // Specific PATCH endpoint for status update
  changeStatus(id: number, active: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { active });
  }
}