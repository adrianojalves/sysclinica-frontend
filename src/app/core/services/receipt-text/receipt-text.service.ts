import { Injectable } from '@angular/core';
import { BaseCrudService } from '../base-crud.service';
import { Observable, finalize } from 'rxjs';
import { ReceiptText } from '../../models/receipt-text/receipt-text.model';

@Injectable({
  providedIn: 'root'
})
export class ReceiptTextService extends BaseCrudService<ReceiptText, number> {
  protected readonly endpoint = 'clinica/receipt-text';

  /**
   * Retrieves the singleton receipt text.
   * Matches GET /api/clinica/receipt-text
   */
  public getReceiptText(): Observable<ReceiptText> {
    this.loading.set(true);
    return this.http.get<ReceiptText>(this.apiUrl).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Updates the singleton receipt text.
   * Matches PUT /api/clinica/receipt-text
   */
  public updateReceiptText(text: string): Observable<ReceiptText> {
    this.loading.set(true);
    return this.http.put<ReceiptText>(this.apiUrl, { text }).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Retrieves available tags for replacement.
   * Matches GET /api/clinica/receipt-text/tags
   */
  public getTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tags`);
  }
}
