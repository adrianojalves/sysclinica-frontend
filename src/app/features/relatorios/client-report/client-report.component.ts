import { Component, inject, signal } from '@angular/core';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';
import { DatePickerModule } from 'primeng/datepicker';
import { DatePipe } from '@angular/common';
import { ClientService } from '../../../core/services/client/client.service';
import { PdfDownloadService } from '../../../core/services/common/pdf-download.service';
import { MessageService } from '../../../core/services/message.service';
import { ClientReportFilter } from '../../../core/models/client/client.model';

@Component({
  selector: 'app-client-report',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS, DatePickerModule],
  providers: [DatePipe],
  templateUrl: './client-report.component.html'
})
export class ClientReportComponent {
  private readonly clientService = inject(ClientService);
  private readonly pdfDownloadService = inject(PdfDownloadService);
  private readonly messageService = inject(MessageService);
  private readonly datePipe = inject(DatePipe);

  public loading = signal<boolean>(false);

  // Both date picker fields default to the current day
  public birthDateStart = signal<Date | null>(new Date());
  public birthDateEnd = signal<Date | null>(new Date());

  public generate(): void {
    this.loading.set(true);

    const filter: ClientReportFilter = {
      birthDateStart: this.birthDateStart() ? this.datePipe.transform(this.birthDateStart(), 'yyyy-MM-dd')! : undefined,
      birthDateEnd: this.birthDateEnd() ? this.datePipe.transform(this.birthDateEnd(), 'yyyy-MM-dd')! : undefined
    };

    this.clientService.getRelatorio(filter).subscribe({
      next: (response) => {
        this.pdfDownloadService.open(response);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.show('error', 'Erro', 'Não foi possível gerar o relatório de clientes.');
        this.loading.set(false);
      }
    });
  }
}
