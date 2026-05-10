import { Injectable } from '@angular/core';
import { BaseCrudService } from '../base-crud.service';
import { Observable, finalize } from 'rxjs';
import { Company } from '../../models/company/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService extends BaseCrudService<Company, number> {
  protected readonly endpoint = 'clinica/company';

  /**
   * Retrieves the singleton company info.
   * Matches GET /api/clinica/company
   */
  public getCompany(): Observable<Company> {
    this.loading.set(true);
    return this.http.get<Company>(this.apiUrl).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Saves or updates the company info.
   * Matches PUT /api/clinica/company
   */
  public saveOrUpdate(data: Company): Observable<Company> {
    this.loading.set(true);
    return this.http.put<Company>(this.apiUrl, data).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Uploads the company logo.
   * Matches POST /api/clinica/company/logo
   */
  public uploadLogo(file: File): Observable<Company> {
    this.loading.set(true);
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<Company>(`${this.apiUrl}/logo`, formData).pipe(
      finalize(() => this.loading.set(false))
    );
  }
}