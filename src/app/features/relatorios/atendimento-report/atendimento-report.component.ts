import { Component, inject, signal } from '@angular/core';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';
import { DatePickerModule } from 'primeng/datepicker';
import { AtendimentoService } from '../../../core/services/atendimento/atendimento.service';
import { PdfDownloadService } from '../../../core/services/common/pdf-download.service';
import { SearchDialogService } from '../../../core/services/common/search-dialog.service';
import { MessageService } from '../../../core/services/message.service';
import { ClinicSearchModalComponent } from '../../../shared/components/clinic-search-modal/clinic-search-modal.component';
import { ClientSearchModalComponent } from '../../../shared/components/client-search-modal/client-search-modal.component';
import { UserSearchModalComponent } from '../../../shared/components/user-search-modal/user-search-modal.component';
import { StatusAtendimento, TipoRelatorio } from '../../../core/models/atendimento/atendimento.model';
import { Clinic } from '../../../core/models/medical/clinic.model';
import { Client } from '../../../core/models/client/client.model';
import { UserSummary } from '../../../core/models/users/user-summary.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-atendimento-report',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS, DatePickerModule],
  providers: [DatePipe],
  templateUrl: './atendimento-report.component.html'
})
export class AtendimentoReportComponent {
  private readonly atendimentoService = inject(AtendimentoService);
  private readonly pdfDownloadService = inject(PdfDownloadService);
  private readonly searchService = inject(SearchDialogService);
  private readonly messageService = inject(MessageService);
  private readonly datePipe = inject(DatePipe);

  public loading = signal<boolean>(false);

  public clinicaId = signal<number | null>(null);
  public clinicaNome = signal<string>('');

  public clienteId = signal<number | null>(null);
  public clienteNome = signal<string>('');

  public usuarioId = signal<number | null>(null);
  public usuarioNome = signal<string>('');

  public dataInicial = signal<Date | null>(null);
  public dataFinal = signal<Date | null>(null);

  public status = signal<StatusAtendimento>('ENCAMINHADO');
  public tipo = signal<TipoRelatorio>('SINTETICO');

  public readonly statusOptions = [
    { label: 'Aberto', value: 'ABERTO' },
    { label: 'Encaminhado', value: 'ENCAMINHADO' }
  ];

  public readonly tipoOptions = [
    { label: 'Sintético', value: 'SINTETICO' },
    { label: 'Analítico - Itens', value: 'ANALITICO_ITENS' },
    { label: 'Analítico - Forma de Pagamento', value: 'ANALITICO_FORMA_PAGAMENTO' }
  ];

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

  public openUserSearch(): void {
    this.searchService.open<UserSummary>(UserSearchModalComponent, 'Pesquisar Usuário')
      .subscribe((user) => {
        if (user) {
          this.usuarioId.set(user.id);
          this.usuarioNome.set(user.name);
        }
      });
  }

  public clearUser(): void {
    this.usuarioId.set(null);
    this.usuarioNome.set('');
  }

  public generate(): void {
    this.loading.set(true);

    const filter = {
      clinicaId: this.clinicaId() ?? undefined,
      clienteId: this.clienteId() ?? undefined,
      usuarioId: this.usuarioId() ?? undefined,
      dataEmissaoInicial: this.dataInicial() ? this.datePipe.transform(this.dataInicial(), 'yyyy-MM-dd')! : undefined,
      dataEmissaoFinal: this.dataFinal() ? this.datePipe.transform(this.dataFinal(), 'yyyy-MM-dd')! : undefined,
      status: this.status(),
      tipo: this.tipo()
    };

    this.atendimentoService.getRelatorio(filter).subscribe({
      next: (response) => {
        this.pdfDownloadService.open(response);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.show('error', 'Erro', 'Não foi possível gerar o relatório.');
        this.loading.set(false);
      }
    });
  }
}
