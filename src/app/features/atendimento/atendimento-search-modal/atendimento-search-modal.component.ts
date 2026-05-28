import { Component, inject, signal } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AtendimentoService } from '../../../core/services/atendimento/atendimento.service';
import { AtendimentoResponse, AtendimentoFilter } from '../../../core/models/atendimento/atendimento.model';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';

@Component({
  selector: 'app-atendimento-search-modal',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './atendimento-search-modal.component.html'
})
export class AtendimentoSearchModalComponent {
  private readonly atendimentoService = inject(AtendimentoService);
  private readonly ref = inject(DynamicDialogRef);

  public atendimentos = signal<AtendimentoResponse[]>([]);
  public loading = signal<boolean>(false);
  public hasSearched = signal<boolean>(false);

  public filterCliente = signal<string>('');
  public filterClinica = signal<string>('');
  public filterUsuario = signal<string>('');

  public hasAnyFilter(): boolean {
    return !!(this.filterCliente().trim() || this.filterClinica().trim() || this.filterUsuario().trim());
  }

  public search(): void {
    if (!this.hasAnyFilter()) return;

    this.loading.set(true);
    const filter: AtendimentoFilter = {
      nomeCliente: this.filterCliente().trim() || undefined,
      nomeClinica: this.filterClinica().trim() || undefined,
      nomeUsuario: this.filterUsuario().trim() || undefined
    };

    this.atendimentoService.findFiltered(filter, 0, 50).subscribe({
      next: (res) => {
        this.atendimentos.set(res.content);
        this.hasSearched.set(true);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  public selectAtendimento(atendimento: AtendimentoResponse): void {
    this.ref.close(atendimento);
  }

  public formatDate(dateStr: string): string {
    if (!dateStr) return '---';
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  }

  public getStatusLabel(status: string): string {
    return status === 'ABERTO' ? 'Aberto' : 'Encaminhado';
  }

  public getStatusClass(status: string): string {
    return status === 'ABERTO'
      ? 'bg-verde-teal/10 text-verde-teal border border-verde-teal/30'
      : 'bg-azul-prisma/10 text-azul-prisma border border-azul-prisma/30';
  }
}
