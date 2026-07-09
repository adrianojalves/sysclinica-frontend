import { Injectable } from '@angular/core';
import { BaseCrudService } from '../base-crud.service';
import { Log, LogFilter } from '../../models/logs/log.model';
import { Page } from '../../models/page.model';
import { HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogService extends BaseCrudService<Log, number> {
  protected readonly endpoint = 'clinica/logs';

  /**
   * Fetches a paginated list of logs with optional filtering.
   */
  findPaginated(
    page: number,
    size: number,
    filter?: LogFilter
  ): Observable<Page<Log>> {
    this.loading.set(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter) {
      if (filter.id !== undefined && filter.id !== null) {
        params = params.set('id', filter.id.toString());
      }
      if (filter.name) {
        params = params.set('name', filter.name);
      }
      if (filter.startDate) {
        params = params.set('startDate', filter.startDate);
      }
      if (filter.endDate) {
        params = params.set('endDate', filter.endDate);
      }
      if (filter.userId !== undefined && filter.userId !== null) {
        params = params.set('userId', filter.userId.toString());
      }
      if (filter.userName) {
        params = params.set('userName', filter.userName);
      }
      if (filter.log) {
        params = params.set('log', filter.log);
      }
    }

    return this.http.get<Page<Log>>(this.apiUrl, { params }).pipe(
      finalize(() => this.loading.set(false))
    );
  }
}
