import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { BaseCrudService } from '../base-crud.service';
import { Clinic, ClinicFilter } from '../../models/medical/clinic.model';
import { Page } from '../../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class ClinicService extends BaseCrudService<Clinic, number> {
  protected readonly endpoint = 'clinica/clinics';

  /**
   * List clinics with pagination and custom filters
   */
  public listAll(page: number, size: number, filter: ClinicFilter): Observable<Page<Clinic>> {
    this.loading.set(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.name) params = params.set('name', filter.name);
    if (filter.cnpj) params = params.set('cnpj', filter.cnpj);

    return this.http.get<Page<Clinic>>(this.apiUrl, { params }).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Check if CNPJ already exists in database
   */
  public checkCnpjExists(cnpj: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists`, { 
      params: new HttpParams().set('cnpj', cnpj) 
    });
  }

  public checkNameExists(name: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/name`, { 
      params: new HttpParams().set('name', name) 
    });
  }

  /**
   * Patch only the status of the clinic
   */
  public updateStatus(id: number, active: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { active });
  }
}