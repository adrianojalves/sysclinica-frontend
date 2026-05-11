// client.service.ts
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { BaseCrudService } from '../base-crud.service';
import { Client, ClientFilter } from '../../models/client/client.model';
import { Page } from '../../models/page.model';

@Injectable({ providedIn: 'root' })
export class ClientService extends BaseCrudService<Client, number> {
  
  // Defining the specific endpoint for this service
  protected readonly endpoint = 'clinica/clients';

  /**
   * Fetch filtered clients with pagination.
   * This logic is specific to Client, so it remains here.
   */
  public findFiltered(page: number, size: number, filter: ClientFilter): Observable<Page<Client>> {
    this.loading.set(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.name) params = params.set('name', filter.name);
    if (filter.cpf) params = params.set('cpf', filter.cpf);

    return this.http.get<Page<Client>>(this.apiUrl, { params })
      .pipe(finalize(() => this.loading.set(false)));
  }

  /**
   * Searches for a client by CPF using the secure hash strategy.
   * Used for the "Upsert Fluido" logic in the frontend.
   */
  public getByCpf(cpf: string): Observable<Client> {
    this.loading.set(true);
    return this.http.get<Client>(`${this.apiUrl}/by-cpf/${cpf}`).pipe(
      finalize(() => this.loading.set(false))
    );
  }
}