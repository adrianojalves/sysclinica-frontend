import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { ViaCepResponse } from '../models/viacep-response.model';

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private readonly http = inject(HttpClient);
  private readonly VIA_CEP_URL = 'https://viacep.com.br/ws';

  /**
   * Search for address details by CEP.
   * Silently fails to allow manual input if the service is down or CEP is invalid.
   */
  public getAddressByCep(cep: string): Observable<ViaCepResponse | null> {
    // Remove non-digit characters
    const cleanCep = cep.replace(/\D/g, '');

    // Validate basic length before calling external API
    if (cleanCep.length !== 8) {
      return of(null);
    }

    return this.http.get<ViaCepResponse>(`${this.VIA_CEP_URL}/${cleanCep}/json/`).pipe(
      map(data => {
        // ViaCEP returns { erro: "true" } for valid format but non-existent CEP
        if (data.erro === 'true') {
          return null;
        }
        return data;
      }),
      // Handle 400 errors or network failures silently
      catchError(() => of(null))
    );
  }
}