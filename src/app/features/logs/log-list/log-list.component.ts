import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';
import { LogService } from '../../../core/services/logs/log.service';
import { MessageService } from '../../../core/services/message.service';
import { Log, LogFilter } from '../../../core/models/logs/log.model';
import { TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-log-list',
  standalone: true,
  imports: [
    ...SHARED_UI_IMPORTS,
    DatePickerModule
  ],
  providers: [DatePipe],
  templateUrl: './log-list.component.html'
})
export class LogListComponent implements OnInit {
  private readonly logService = inject(LogService);
  private readonly messageService = inject(MessageService);
  private readonly datePipe = inject(DatePipe);

  // State Signals
  public logs = signal<Log[]>([]);
  public totalRecords = signal<number>(0);
  public isLoading = this.logService.loading;

  // Filter State
  public filterLog = signal<string>('');
  public filterUserName = signal<string>('');
  public startDateValue: Date | null = null;
  public endDateValue: Date | null = null;

  // Pagination State
  private currentPage = 0;
  private currentSize = 10;

  ngOnInit(): void {
    // Initial load happens via PrimeNG's onLazyLoad event
  }

  /**
   * Triggered by PrimeNG table on pagination, sorting, or initial load.
   */
  public loadLogs(event: TableLazyLoadEvent): void {
    this.currentPage = event.first ? event.first / (event.rows || 10) : 0;
    this.currentSize = event.rows || 10;
    this.fetchData();
  }

  /**
   * Triggered by the search button or pressing Enter.
   */
  public onSearch(): void {
    this.currentPage = 0; // Reset to first page on new search
    this.fetchData();
  }

  /**
   * Triggered by the clear/reset button.
   */
  public onClear(): void {
    this.filterLog.set('');
    this.filterUserName.set('');
    this.startDateValue = null;
    this.endDateValue = null;
    this.currentPage = 0;
    this.fetchData();
  }

  /**
   * Centralized method to call the service.
   */
  private fetchData(): void {
    const filter: LogFilter = {};

    if (this.filterLog().trim()) {
      filter.log = this.filterLog().trim();
    }
    if (this.filterUserName().trim()) {
      filter.userName = this.filterUserName().trim();
    }
    if (this.startDateValue) {
      filter.startDate = this.datePipe.transform(this.startDateValue, 'yyyy-MM-dd') || undefined;
    }
    if (this.endDateValue) {
      filter.endDate = this.datePipe.transform(this.endDateValue, 'yyyy-MM-dd') || undefined;
    }

    this.logService.findPaginated(this.currentPage, this.currentSize, filter).subscribe({
      next: (pageData) => {
        this.logs.set(pageData.content || []);
        this.totalRecords.set(pageData.page?.totalElements || 0);
      },
      error: () => {
        this.messageService.show('error', 'Erro', 'Não foi possível carregar a lista de logs.');
      }
    });
  }
}
