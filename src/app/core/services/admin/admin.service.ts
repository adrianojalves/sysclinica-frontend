import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ImportResult } from '../../models/admin/import-result.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  public loading = signal<boolean>(false);

  private get baseUrl(): string {
    return `${environment.apiUrl}/admin`;
  }

  public importarTabela(file: File): Observable<ImportResult> {
    this.loading.set(true);
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportResult>(`${this.baseUrl}/importar-tabela`, formData).pipe(
      finalize(() => this.loading.set(false))
    );
  }
}
