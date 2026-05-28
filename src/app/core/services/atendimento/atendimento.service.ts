import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { BaseCrudService } from '../base-crud.service';
import {
  AtendimentoResponse,
  AtendimentoRequest,
  AtendimentoFilter,
  AtendimentoItemResponse
} from '../../models/atendimento/atendimento.model';
import { environment } from '../../../../environments/environment';

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

  findFiltered(filter: AtendimentoFilter, page: number = 0, size: number = 10): Observable<PagedAtendimento> {
    this.loading.set(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.nomeCliente) params = params.set('nomeCliente', filter.nomeCliente);
    if (filter.nomeClinica) params = params.set('nomeClinica', filter.nomeClinica);
    if (filter.nomeUsuario) params = params.set('nomeUsuario', filter.nomeUsuario);

    return this.http.get<PagedAtendimento>(this.apiUrl, { params }).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  getItens(atendimentoId: number): Observable<AtendimentoItemResponse[]> {
    return this.http.get<AtendimentoItemResponse[]>(
      `${this.apiUrl}/${atendimentoId}/itens`
    );
  }

  override save(data: Partial<AtendimentoRequest>): Observable<AtendimentoResponse> {
    this.loading.set(true);
    return this.http.post<AtendimentoResponse>(this.apiUrl, data).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  override update(id: number, data: Partial<AtendimentoRequest>): Observable<AtendimentoResponse> {
    this.loading.set(true);
    return this.http.put<AtendimentoResponse>(`${this.apiUrl}/${id}`, data).pipe(
      finalize(() => this.loading.set(false))
    );
  }
}
