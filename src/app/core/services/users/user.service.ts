import { Injectable } from '@angular/core';
import { BaseCrudService } from '../base-crud.service';
import { User } from '../../models/users/user.model';
import { Page } from '../../models/page.model';
import { HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseCrudService<User, number> {
  protected readonly endpoint = 'clinica/users';

  /**
   * Fetches a paginated list of users, optionally filtered by name.
   */
  findPaginated(page: number, size: number, name?: string): Observable<Page<User>> {
    this.loading.set(true);
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (name) {
      params = params.set('name', name);
    }

    return this.http.get<Page<User>>(this.apiUrl, { params }).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Partially updates the user's status.
   * Assuming the backend expects a PATCH request for partial updates.
   */
  updateStatus(id: number, active: boolean): Observable<void> {
    this.loading.set(true);
    // Sending the structure expected by UserStatusDTO
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { active }).pipe(
      finalize(() => this.loading.set(false))
    );
  }
}