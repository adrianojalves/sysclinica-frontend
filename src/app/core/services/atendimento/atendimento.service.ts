import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BaseCrudService } from '../base-crud.service';
import {
  AtendimentoFilter,
  AtendimentoItemResponse,
  AtendimentoPagamentoRequest,
  AtendimentoPagamentoResponse,
  AtendimentoRequest,
  AtendimentoResponse
} from '../../models/atendimento/atendimento.model';

export interface PagedAtendimento {
  content: AtendimentoResponse[];
  page: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AtendimentoService extends BaseCrudService<AtendimentoResponse, number> {
  protected readonly endpoint = 'clinica/atendimentos';

  public loadingPagamento = signal<boolean>(false);

  private handleHttpError = (error: HttpErrorResponse): Observable<never> => {
    if (error.status === 400 && Array.isArray(error.error)) {
      error.error.forEach((err: { field: string; message: string }) => {
        this.messageService.show('warning', 'Validação', err.message);
      });
    } else {
      const msg = error.error?.message || 'Ocorreu um erro ao processar a requisição.';
      this.messageService.show('error', 'Erro', msg);
    }
    return throwError(() => error);
  };

  findFiltered(filter: AtendimentoFilter, page = 0, size = 10): Observable<PagedAtendimento> {
    this.loading.set(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.nomeCliente) params = params.set('nomeCliente', filter.nomeCliente);
    if (filter.nomeClinica) params = params.set('nomeClinica', filter.nomeClinica);
    if (filter.nomeUsuario) params = params.set('nomeUsuario', filter.nomeUsuario);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.clienteId) params = params.set('clienteId', filter.clienteId.toString());
    if (filter.clinicaId) params = params.set('clinicaId', filter.clinicaId.toString());
    if (filter.dataConsultaExameInicio) params = params.set('dataConsultaExameInicio', filter.dataConsultaExameInicio);
    if (filter.dataConsultaExameFim) params = params.set('dataConsultaExameFim', filter.dataConsultaExameFim);

    return this.http.get<PagedAtendimento>(this.apiUrl, { params }).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  getItens(atendimentoId: number): Observable<AtendimentoItemResponse[]> {
    return this.http.get<AtendimentoItemResponse[]>(`${this.apiUrl}/${atendimentoId}/itens`);
  }

  getPagamentos(atendimentoId: number): Observable<AtendimentoPagamentoResponse[]> {
    return this.http.get<AtendimentoPagamentoResponse[]>(`${this.apiUrl}/${atendimentoId}/pagamentos`);
  }

  addPagamento(atendimentoId: number, data: AtendimentoPagamentoRequest): Observable<AtendimentoPagamentoResponse> {
    this.loadingPagamento.set(true);
    return this.http.post<AtendimentoPagamentoResponse>(
      `${this.apiUrl}/${atendimentoId}/pagamentos`, data
    ).pipe(
      catchError(this.handleHttpError),
      finalize(() => this.loadingPagamento.set(false))
    );
  }

  removePagamento(atendimentoId: number, pagamentoId: number): Observable<void> {
    this.loadingPagamento.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${atendimentoId}/pagamentos/${pagamentoId}`).pipe(
      catchError(this.handleHttpError),
      finalize(() => this.loadingPagamento.set(false))
    );
  }

  getRecibo(atendimentoId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/${atendimentoId}/recibo`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(catchError(this.handleHttpError));
  }

  getEncaminhamento(atendimentoId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/${atendimentoId}/encaminhamento`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(catchError(this.handleHttpError));
  }

  finalizar(atendimentoId: number): Observable<AtendimentoResponse> {
    this.loading.set(true);
    return this.http.post<AtendimentoResponse>(`${this.apiUrl}/${atendimentoId}/finalizar`, null).pipe(
      catchError(this.handleHttpError),
      finalize(() => this.loading.set(false))
    );
  }

  override save(data: Partial<AtendimentoRequest>): Observable<AtendimentoResponse> {
    this.loading.set(true);
    return this.http.post<AtendimentoResponse>(this.apiUrl, data).pipe(
      catchError(this.handleHttpError),
      finalize(() => this.loading.set(false))
    );
  }

  override update(id: number, data: Partial<AtendimentoRequest>): Observable<AtendimentoResponse> {
    this.loading.set(true);
    return this.http.put<AtendimentoResponse>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleHttpError),
      finalize(() => this.loading.set(false))
    );
  }
}
