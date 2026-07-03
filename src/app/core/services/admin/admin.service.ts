import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ImportResult } from '../../models/admin/import-result.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  public loading = signal<boolean>(false);
  public loadingDelete = signal<boolean>(false);
  public loadingBackup = signal<boolean>(false);

  private get baseUrl(): string {
    return `${environment.apiUrl}/admin`;
  }

  public deletarDados(): Observable<void> {
    this.loadingDelete.set(true);
    return this.http.delete<void>(`${this.baseUrl}/deletar-dados`).pipe(
      finalize(() => this.loadingDelete.set(false))
    );
  }

  public importarTabela(file: File): Observable<ImportResult> {
    this.loading.set(true);
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportResult>(`${this.baseUrl}/importar-tabela`, formData).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  public downloadBackup(): Observable<HttpResponse<Blob>> {
    this.loadingBackup.set(true);
    return this.http.get(`${this.baseUrl}/backup`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      finalize(() => this.loadingBackup.set(false))
    );
  }
}
