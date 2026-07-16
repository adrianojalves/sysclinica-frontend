import { Injectable, signal } from '@angular/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BaseCrudService } from '../base-crud.service';

export interface RepasseReportFilter {
  clinicaId?: number;
  dataEmissaoInicial?: string;
  dataEmissaoFinal?: string;
  tipoRelatorio?: string;
}

@Injectable({ providedIn: 'root' })
export class RepasseService extends BaseCrudService<never> {
  protected readonly endpoint = 'clinica/repasse';

  public loadingRelatorio = signal<boolean>(false);

  getRelatorio(filter: RepasseReportFilter): Observable<HttpResponse<Blob>> {
    this.loadingRelatorio.set(true);
    let params = new HttpParams();

    if (filter.clinicaId) params = params.set('clinicaId', filter.clinicaId.toString());
    if (filter.dataEmissaoInicial) params = params.set('dataEmissaoInicial', filter.dataEmissaoInicial);
    if (filter.dataEmissaoFinal) params = params.set('dataEmissaoFinal', filter.dataEmissaoFinal);
    if (filter.tipoRelatorio) params = params.set('tipoRelatorio', filter.tipoRelatorio);

    return this.http.get(`${this.apiUrl}/relatorios`, {
      params,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      catchError((error) => {
        this.messageService.show('error', 'Erro', 'Não foi possível gerar o relatório de repasse.');
        throw error;
      }),
      finalize(() => this.loadingRelatorio.set(false))
    );
  }
}
