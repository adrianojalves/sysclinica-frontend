import { Component, inject, signal } from '@angular/core';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';
import { DatePickerModule } from 'primeng/datepicker';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { PdfDownloadService } from '../../../core/services/common/pdf-download.service';
import { SearchDialogService } from '../../../core/services/common/search-dialog.service';
import { MessageService } from '../../../core/services/message.service';
import { ClinicSearchModalComponent } from '../../../shared/components/clinic-search-modal/clinic-search-modal.component';
import { ClientSearchModalComponent } from '../../../shared/components/client-search-modal/client-search-modal.component';
import { DoctorSearchModalComponent } from '../../../shared/components/doctor-search-modal/doctor-search-modal.component';
import { Clinic } from '../../../core/models/medical/clinic.model';
import { Client } from '../../../core/models/client/client.model';
import { Doctor } from '../../../core/models/medical/doctor.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-historico-report',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS, DatePickerModule],
  providers: [DatePipe],
  templateUrl: './historico-report.component.html'
})
export class HistoricoReportComponent {
  private readonly http = inject(HttpClient);
  private readonly pdfDownloadService = inject(PdfDownloadService);
  private readonly searchService = inject(SearchDialogService);
  private readonly messageService = inject(MessageService);
  private readonly datePipe = inject(DatePipe);

  public loading = signal<boolean>(false);

  public clienteId = signal<number | null>(null);
  public clienteNome = signal<string>('');

  public clinicaId = signal<number | null>(null);
  public clinicaNome = signal<string>('');

  public doctorId = signal<number | null>(null);
  public doctorNome = signal<string>('');

  public dataInicial = signal<Date | null>(null);
  public dataFinal = signal<Date | null>(null);

  public openClientSearch(): void {
    this.searchService.open<Client>(ClientSearchModalComponent, 'Pesquisar Cliente')
      .subscribe((client) => {
        if (client) {
          this.clienteId.set(client.id);
          this.clienteNome.set(client.name);
        }
      });
  }

  public clearClient(): void {
    this.clienteId.set(null);
    this.clienteNome.set('');
  }

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

  public openDoctorSearch(): void {
    this.searchService.open<Doctor>(DoctorSearchModalComponent, 'Pesquisar Médico')
      .subscribe((doctor) => {
        if (doctor) {
          this.doctorId.set(doctor.id);
          this.doctorNome.set(doctor.name);
        }
      });
  }

  public clearDoctor(): void {
    this.doctorId.set(null);
    this.doctorNome.set('');
  }

  public generate(): void {
    this.loading.set(true);

    let params = new HttpParams();

    if (this.clienteId()) params = params.set('clienteId', this.clienteId()!.toString());
    if (this.clinicaId()) params = params.set('clinicaId', this.clinicaId()!.toString());
    if (this.doctorId()) params = params.set('doctorId', this.doctorId()!.toString());
    if (this.dataInicial()) params = params.set('dataEmissaoInicial', this.datePipe.transform(this.dataInicial(), 'yyyy-MM-dd')!);
    if (this.dataFinal()) params = params.set('dataEmissaoFinal', this.datePipe.transform(this.dataFinal(), 'yyyy-MM-dd')!);

    this.http.get(`${environment.apiUrl}/clinica/pacientes/relatorios/historico`, {
      params,
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.pdfDownloadService.open(response);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.show('error', 'Erro', 'Não foi possível gerar o relatório de histórico do paciente.');
        this.loading.set(false);
      }
    });
  }
}
