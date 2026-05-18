import { inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MessageService } from './message.service'; 
import { environment } from '../../../environments/environment';

/**
 * Base class for all CRUD services.
 * Implements common HTTP operations using TypeScript Generics.
 */
export abstract class BaseCrudService<T, ID = number> {
  protected readonly http = inject(HttpClient);
  protected readonly messageService = inject(MessageService);
  
  // The specific API path for the entity (e.g., 'clinics', 'doctors')
  protected abstract readonly endpoint: string;

  // Signal to track loading state globally for the service
  public loading = signal<boolean>(false);

  protected get apiUrl(): string {
    return `${environment.apiUrl}/${this.endpoint}`;
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    if (error.status === 400 && Array.isArray(error.error)) {
      error.error.forEach((err: { field: string; message: string }) => {
        this.messageService.show('warning', 'Validação', err.message);
      });
    } else {
      const genericMessage = error.error?.message || 'Ocorreu um erro ao processar a requisição.';
      this.messageService.show('error', 'Erro', genericMessage);
    }
    
    return throwError(() => error);
  };

  /**
   * Retrieves all records from the server.
   */
  findAll(): Observable<T[]> {
    this.loading.set(true);
    return this.http.get<T[]>(this.apiUrl).pipe(
      catchError(this.handleError),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Retrieves a single record by its unique identifier.
   */
  findById(id: ID): Observable<T> {
    this.loading.set(true);
    return this.http.get<T>(`${this.apiUrl}/${id}`).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Persists a new record to the database.
   */
  save(data: Partial<T>): Observable<T> {
    this.loading.set(true);
    return this.http.post<T>(this.apiUrl, data).pipe(
      catchError(this.handleError),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Updates an existing record.
   */
  update(id: ID, data: Partial<T>): Observable<T> {
    this.loading.set(true);
    return this.http.put<T>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Deletes a record from the server.
   */
  delete(id: ID): Observable<void> {
    this.loading.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError),
      finalize(() => this.loading.set(false))
    );
  }
}