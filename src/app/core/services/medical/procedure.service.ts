import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from '../base-crud.service';
import { MedicalProcedure, ProcedureType } from '../../models/medical/procedure.model';
import { Page } from '../../models/page.model';
import { HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { ProcedureFilter } from '../../models/medical/procedure-filter.model';
import { FileDownloadService } from '../common/file-download.service';
import { FileUploadService } from '../common/file-upload.service';

@Injectable({
  providedIn: 'root'
})
export class MedicalProcedureService extends BaseCrudService<MedicalProcedure, number> {
  protected readonly endpoint = 'clinica/procedures';

  private readonly fileDownloadService = inject(FileDownloadService);
  private readonly fileUploadService = inject(FileUploadService);

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

  /**
   * Exports procedures spreadsheet.
   */
  exportExcel(): Observable<any> {
    this.loading.set(true);
    const url = `${this.apiUrl}/export`;
    const filename = 'procedimentos-medicos.xlsx';
    return this.fileDownloadService.downloadFromUrl(url, filename).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Imports procedures spreadsheet to update tags.
   */
  importExcel(file: File): Observable<any> {
    this.loading.set(true);
    const url = `${this.apiUrl}/import`;
    return this.fileUploadService.upload(url, file).pipe(
      finalize(() => this.loading.set(false))
    );
  }
}