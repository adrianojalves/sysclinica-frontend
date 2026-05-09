import { HttpClient } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Base class for all CRUD services.
 * Implements common HTTP operations using TypeScript Generics.
 */
export abstract class BaseCrudService<T, ID = number> {
  protected readonly http = inject(HttpClient);
  
  // The specific API path for the entity (e.g., 'clinics', 'doctors')
  protected abstract readonly endpoint: string;

  // Signal to track loading state globally for the service
  public loading = signal<boolean>(false);

  protected get apiUrl(): string {
    return `${environment.apiUrl}/${this.endpoint}`;
  }

  /**
   * Retrieves all records from the server.
   */
  findAll(): Observable<T[]> {
    this.loading.set(true);
    return this.http.get<T[]>(this.apiUrl).pipe(
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
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Updates an existing record.
   */
  update(id: ID, data: Partial<T>): Observable<T> {
    this.loading.set(true);
    return this.http.put<T>(`${this.apiUrl}/${id}`, data).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Deletes a record from the server.
   */
  delete(id: ID): Observable<void> {
    this.loading.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      finalize(() => this.loading.set(false))
    );
  }
}