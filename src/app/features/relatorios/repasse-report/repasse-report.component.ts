import { Component, inject, signal } from '@angular/core';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';
import { DatePickerModule } from 'primeng/datepicker';
import { DatePipe } from '@angular/common';
import { RepasseService } from '../../../core/services/repasse/repasse.service';
import { PdfDownloadService } from '../../../core/services/common/pdf-download.service';
import { SearchDialogService } from '../../../core/services/common/search-dialog.service';
import { MessageService } from '../../../core/services/message.service';
import { ClinicSearchModalComponent } from '../../../shared/components/clinic-search-modal/clinic-search-modal.component';
import { Clinic } from '../../../core/models/medical/clinic.model';

@Component({
  selector: 'app-repasse-report',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS, DatePickerModule],
  providers: [DatePipe],
  templateUrl: './repasse-report.component.html'
})
export class RepasseReportComponent {
  private readonly repasseService = inject(RepasseService);
  private readonly pdfDownloadService = inject(PdfDownloadService);
  private readonly searchService = inject(SearchDialogService);
  private readonly messageService = inject(MessageService);
  private readonly datePipe = inject(DatePipe);

  public loading = signal<boolean>(false);

  public clinicaId = signal<number | null>(null);
  public clinicaNome = signal<string>('');

  public dataInicial = signal<Date | null>(null);
  public dataFinal = signal<Date | null>(null);

  public openClinicSearch(): void {
    this.searchService.open<Clinic>(ClinicSearchModalComponent, 'Pesquisar Clínica')
      .subscribe((clinic) => {
        if (clinic) {
          this.clinicaId.set(clinic.id);
          this.clinicaNome.set(clinic.name);
        }
      });
  }

  public clearClinic(): void {
    this.clinicaId.set(null);
    this.clinicaNome.set('');
  }

  public generate(): void {
    this.loading.set(true);

    const filter = {
      clinicaId: this.clinicaId() ?? undefined,
      dataEmissaoInicial: this.dataInicial()
        ? this.datePipe.transform(this.dataInicial(), 'yyyy-MM-dd')!
        : undefined,
      dataEmissaoFinal: this.dataFinal()
        ? this.datePipe.transform(this.dataFinal(), 'yyyy-MM-dd')!
        : undefined
    };

    this.repasseService.getRelatorio(filter).subscribe({
      next: (response) => {
        this.pdfDownloadService.open(response);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
