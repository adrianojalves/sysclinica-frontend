import { Component, inject, signal } from '@angular/core';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';
import { AdminService } from '../../../core/services/admin/admin.service';
import { MessageService } from '../../../core/services/message.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ImportResult } from '../../../core/models/admin/import-result.model';

@Component({
  selector: 'app-importar-tabela',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './importar-tabela.component.html'
})
export class ImportarTabelaComponent {
  public readonly adminService = inject(AdminService);
  private readonly messageService = inject(MessageService);
  private readonly loadingService = inject(LoadingService);

  public resultado = signal<ImportResult | null>(null);
  public arquivoSelecionado = signal<File | null>(null);

  public onArquivoSelecionado(event: any): void {
    const file: File = event.files[0];
    if (file) {
      this.arquivoSelecionado.set(file);
      this.resultado.set(null);
    }
  }

  public onEnviar(): void {
    const file = this.arquivoSelecionado();
    if (!file) {
      this.messageService.show('warning', 'Atenção', 'Selecione um arquivo CSV antes de enviar.');
      return;
    }

    this.loadingService.show();
    this.adminService.importarTabela(file).subscribe({
      next: (res: ImportResult) => {
        this.resultado.set(res);
        this.arquivoSelecionado.set(null);
        this.loadingService.hide();
        this.messageService.show('success', 'Importação Concluída', `${res.totalLinhas} linha(s) processada(s).`);
      },
      error: (err: any) => {
        this.loadingService.hide();
        const msg = err.error?.message || 'Erro ao processar o arquivo CSV.';
        this.messageService.show('error', 'Erro na Importação', msg);
      }
    });
  }

  public async onDeletarDados(): Promise<void> {
    const confirmed = await this.messageService.question(
      'Deletar Todos os Dados',
      'Esta ação irá remover permanentemente todas as clínicas, médicos, procedimentos e vínculos cadastrados. Deseja continuar?'
    );
    if (!confirmed) return;

    this.adminService.deletarDados().subscribe({
      next: () => {
        this.resultado.set(null);
        this.messageService.show('success', 'Dados Deletados', 'Todos os dados foram removidos com sucesso.');
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Erro ao deletar os dados.';
        this.messageService.show('error', 'Erro', msg);
      }
    });
  }

  public onLimpar(): void {
    this.arquivoSelecionado.set(null);
    this.resultado.set(null);
  }
}
