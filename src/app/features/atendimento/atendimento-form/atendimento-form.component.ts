import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';
import { DatePickerModule } from 'primeng/datepicker';
import { MenuModule } from 'primeng/menu';
import { DialogService } from 'primeng/dynamicdialog';
import { AtendimentoService } from '../../../core/services/atendimento/atendimento.service';
import { ClinicProcedureService } from '../../../core/services/medical/clinic-procedure.service';
import { MessageService } from '../../../core/services/message.service';
import { SearchDialogService } from '../../../core/services/common/search-dialog.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClientSearchModalComponent } from '../../../shared/components/client-search-modal/client-search-modal.component';
import { ClientRegisterModalComponent } from '../../../shared/components/client-register-modal/client-register-modal.component';
import { AtendimentoSearchModalComponent } from '../atendimento-search-modal/atendimento-search-modal.component';
import {
  AtendimentoResponse,
  AtendimentoRequest,
  AtendimentoItemLocal,
  AtendimentoPagamentoResponse,
  AtendimentoPagamentoRequest,
  TipoPagamento
} from '../../../core/models/atendimento/atendimento.model';
import { Client } from '../../../core/models/client/client.model';
import { ClinicDoctorProcedure, ClinicDoctorProcedureFilter } from '../../../core/models/medical/clinic-procedure.model';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-atendimento-form',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS, DatePickerModule, MenuModule],
  providers: [DatePipe],
  templateUrl: './atendimento-form.component.html',
  styleUrl: './atendimento-form.component.scss'
})
export class AtendimentoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly atendimentoService = inject(AtendimentoService);
  private readonly clinicProcService = inject(ClinicProcedureService);
  private readonly messageService = inject(MessageService);
  private readonly searchService = inject(SearchDialogService);
  private readonly dialogService = inject(DialogService);
  private readonly authService = inject(AuthService);
  private readonly datePipe = inject(DatePipe);

  public readonly isAdmin = this.authService.isAdmin;

  // --- State ---
  public form!: FormGroup;
  public pagamentoForm!: FormGroup;
  public activeTabIndex = signal<number>(0);

  public atendimentoId = signal<number | null>(null);
  public dataEmissao = signal<string | null>(new Date().toISOString());
  public status = signal<string>('ABERTO');
  /** Tracked internally — loaded from the response and updated when a credit card payment is added */
  private parcelas = signal<number>(1);

  public clienteId = signal<number | null>(null);
  public clienteNome = signal<string>('');

  public clinicaId = signal<number | null>(null);
  public clinicaNome = signal<string>('');

  // Tab 2 - procedure search
  public filterClinicaNome = signal<string>('');
  public filterProcedureNome = signal<string>('');
  public filterDoctorNome = signal<string>('');
  public procedureResults = signal<ClinicDoctorProcedure[]>([]);
  public procedureSearchLoading = signal<boolean>(false);
  public procedureSearched = signal<boolean>(false);

  // Tab 3 - selected items
  public selectedItems = signal<AtendimentoItemLocal[]>([]);

  // Tab 4 - payments
  public pagamentos = signal<AtendimentoPagamentoResponse[]>([]);
  /** Mirrors the payment form control value to keep signal-based reactivity in the template */
  public tipoPagamentoPagamento = signal<TipoPagamento>('DINHEIRO');

  public readonly tabs = [
    { index: 0, label: 'Dados Gerais',   icon: 'pi pi-file'   },
    { index: 1, label: 'Procedimentos',  icon: 'pi pi-search' },
    { index: 2, label: 'Itens',          icon: 'pi pi-list'   },
    { index: 3, label: 'Financeiro',     icon: 'pi pi-dollar' }
  ];

  public readonly tipoPagamentoOptions = [
    { label: 'Dinheiro',          value: 'DINHEIRO'        },
    { label: 'Cartão de Crédito', value: 'CARTAO_CREDITO'  },
    { label: 'Cartão de Débito',  value: 'CARTAO_DEBITO'   },
    { label: 'PIX',               value: 'PIX'             }
  ];

  public printItems: MenuItem[] = [
    {
      label: 'Guia de Encaminhamento',
      icon: 'pi pi-file',
      command: () => this.print('guia')
    },
    {
      label: 'Recibo de Pagamento',
      icon: 'pi pi-receipt',
      command: () => this.print('recibo')
    }
  ];

  public loading = this.atendimentoService.loading;
  public loadingPagamento = this.atendimentoService.loadingPagamento;
  public loadingPrint = signal<boolean>(false);

  // --- Computeds ---

  public isAberto = computed(() => this.status() === 'ABERTO');

  public isCreditCardPagamento = computed(() => this.tipoPagamentoPagamento() === 'CARTAO_CREDITO');

  public hasItems = computed(() => this.selectedItems().length > 0);

  public totalDinheiro = computed(() =>
    this.selectedItems().reduce((sum, i) => sum + (i.price ?? 0), 0)
  );

  public totalCartao = computed(() =>
    this.selectedItems().reduce((sum, i) => sum + (i.priceCard ?? 0), 0)
  );

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      dataConsulta: [null, Validators.required]
    });

    this.pagamentoForm = this.fb.group({
      tipoPagamento: ['DINHEIRO', Validators.required],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      parcelas: [1, [Validators.required, Validators.min(1)]]
    });

    this.pagamentoForm.get('tipoPagamento')!.valueChanges.subscribe((val: TipoPagamento) => {
      this.tipoPagamentoPagamento.set(val);
      if (val !== 'CARTAO_CREDITO') {
        this.pagamentoForm.get('parcelas')!.setValue(1);
      }
    });
  }

  // --- Header actions ---

  public openSearch(): void {
    this.searchService.open<AtendimentoResponse>(AtendimentoSearchModalComponent, 'Pesquisar Atendimento')
      .subscribe(result => {
        if (result) this.loadAtendimento(result);
      });
  }

  public novoAtendimento(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.atendimentoId.set(null);
    this.dataEmissao.set(new Date().toISOString());
    this.status.set('ABERTO');
    this.clienteId.set(null);
    this.clienteNome.set('');
    this.clinicaId.set(null);
    this.clinicaNome.set('');
    this.selectedItems.set([]);
    this.pagamentos.set([]);
    this.parcelas.set(1);
    this.procedureResults.set([]);
    this.procedureSearched.set(false);
    this.form.enable();
    this.form.reset();
    this.pagamentoForm.enable();
    this.pagamentoForm.reset({ tipoPagamento: 'DINHEIRO', parcelas: 1 });
    this.tipoPagamentoPagamento.set('DINHEIRO');
    this.activeTabIndex.set(0);
  }

  private loadAtendimento(atendimento: AtendimentoResponse): void {
    this.atendimentoId.set(atendimento.id);
    this.dataEmissao.set(atendimento.dataEmissao);
    this.status.set(atendimento.status);
    this.clienteId.set(atendimento.codCliente);
    this.clienteNome.set(atendimento.nomeCliente);
    this.clinicaId.set(atendimento.codClinica);
    this.clinicaNome.set(atendimento.nomeClinica);
    this.parcelas.set(atendimento.parcelas ?? 1);

    const dateParts = atendimento.dataConsultaExame?.split('-');
    const dateObj = dateParts
      ? new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2])
      : null;

    this.form.enable();
    this.form.patchValue({ dataConsulta: dateObj });

    if (atendimento.status !== 'ABERTO') {
      this.form.disable();
      this.pagamentoForm.disable();
    } else {
      this.form.enable();
      this.pagamentoForm.enable();
    }

    this.atendimentoService.getItens(atendimento.id).subscribe(itens => {
      const mapped: AtendimentoItemLocal[] = itens.map(i => ({
        clinicId: atendimento.codClinica,
        clinicName: atendimento.nomeClinica,
        codMedico: i.codMedico,
        nomeMedico: i.nomeMedico,
        codMedicalProcedure: i.codMedicalProcedure,
        nomeMedicalProcedure: i.nomeMedicalProcedure,
        transferValue: i.transferValue ?? 0,
        price: i.price,
        transferValueCard: i.transferValueCard ?? 0,
        priceCard: i.priceCard
      }));
      this.selectedItems.set(mapped);
    });

    this.atendimentoService.getPagamentos(atendimento.id).subscribe(pagamentos => {
      this.pagamentos.set(pagamentos);
    });

    this.activeTabIndex.set(0);
  }

  // --- Tab 1: Pesquisa de cliente ---

  public openClientSearch(): void {
    this.searchService.open<Client>(ClientSearchModalComponent, 'Pesquisar Cliente')
      .subscribe(client => {
        if (client) {
          this.clienteId.set(client.id);
          this.clienteNome.set(client.name);
        }
      });
  }

  public openClientRegister(): void {
    const ref = this.dialogService.open(ClientRegisterModalComponent, {
      header: 'Cadastrar Novo Cliente',
      width: '90%',
      style: { 'max-width': '860px' },
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      dismissableMask: false,
      closable: true
    });

    ref.onClose.subscribe((client: Client | null) => {
      if (client) {
        this.clienteId.set(client.id);
        this.clienteNome.set(client.name);
      }
    });
  }

  // --- Tab 2: Pesquisa de procedimentos ---

  public searchProcedures(): void {
    const hasClinicFilter = !this.clinicaId() && this.filterClinicaNome().trim();
    const hasOtherFilter = this.filterProcedureNome().trim() || this.filterDoctorNome().trim();

    if (!hasClinicFilter && !hasOtherFilter && !this.clinicaId()) return;

    this.procedureSearchLoading.set(true);
    const filter: ClinicDoctorProcedureFilter = {};

    if (this.clinicaId()) {
      filter.clinicId = this.clinicaId()!;
    } else if (this.filterClinicaNome().trim()) {
      filter.clinicName = this.filterClinicaNome().trim();
    }

    if (this.filterProcedureNome().trim()) filter.procedureName = this.filterProcedureNome().trim();
    if (this.filterDoctorNome().trim()) filter.doctorName = this.filterDoctorNome().trim();

    this.clinicProcService.list(filter, 0, 50).subscribe({
      next: (res: any) => {
        this.procedureResults.set(res.content || []);
        this.procedureSearched.set(true);
        this.procedureSearchLoading.set(false);
      },
      error: () => this.procedureSearchLoading.set(false)
    });
  }

  public addProcedure(proc: ClinicDoctorProcedure): void {
    const alreadyAdded = this.selectedItems().some(
      i => i.codMedicalProcedure === proc.medicalProcedureId && i.codMedico === proc.doctorId
    );
    if (alreadyAdded) {
      this.messageService.toast('warning', 'Procedimento já adicionado ao atendimento.');
      return;
    }

    if (!this.clinicaId()) {
      this.clinicaId.set(proc.clinicId);
      this.clinicaNome.set(proc.clinicName || '');
    }

    const item: AtendimentoItemLocal = {
      clinicId: proc.clinicId,
      clinicName: proc.clinicName || '',
      codMedico: proc.doctorId,
      nomeMedico: proc.doctorName,
      codMedicalProcedure: proc.medicalProcedureId,
      nomeMedicalProcedure: proc.procedureName || '',
      transferValue: proc.transferValue,
      price: proc.price,
      transferValueCard: proc.transferValueCard,
      priceCard: proc.priceCard
    };

    this.selectedItems.update(items => [...items, item]);
    this.messageService.toast('success', 'Procedimento adicionado ao atendimento.');
  }

  // --- Tab 3: Remover procedimento ---

  public async removeProcedure(index: number): Promise<void> {
    const confirmed = await this.messageService.question(
      'Remover Procedimento',
      'Deseja remover este procedimento do atendimento?'
    );
    if (confirmed) {
      this.selectedItems.update(items => items.filter((_, i) => i !== index));

      if (this.selectedItems().length === 0 && !this.atendimentoId()) {
        this.clinicaId.set(null);
        this.clinicaNome.set('');
      }
    }
  }

  // --- Tab 4: Payments ---

  public adicionarPagamento(): void {
    if (this.pagamentoForm.invalid) {
      this.pagamentoForm.markAllAsTouched();
      this.messageService.show('warning', 'Validação', 'Preencha todos os campos do pagamento.');
      return;
    }

    if (!this.atendimentoId()) {
      this.messageService.show('warning', 'Atenção', 'Salve o atendimento antes de adicionar pagamentos.');
      return;
    }

    const tipoPagamento: TipoPagamento = this.pagamentoForm.get('tipoPagamento')!.value;
    const valor: number = this.pagamentoForm.get('valor')!.value;
    const parcelas: number = tipoPagamento === 'CARTAO_CREDITO'
      ? (this.pagamentoForm.get('parcelas')!.value || 1)
      : 1;

    const request: AtendimentoPagamentoRequest = { tipoPagamento, valor, parcelas };

    this.atendimentoService.addPagamento(this.atendimentoId()!, request).subscribe({
      next: (res) => {
        this.pagamentos.update(list => [...list, res]);

        if (tipoPagamento === 'CARTAO_CREDITO') {
          this.parcelas.set(parcelas);
        }

        this.pagamentoForm.patchValue({ tipoPagamento: 'DINHEIRO', valor: null, parcelas: 1 });
        this.tipoPagamentoPagamento.set('DINHEIRO');
      }
    });
  }

  public async removerPagamento(pagamento: AtendimentoPagamentoResponse, index: number): Promise<void> {
    const confirmed = await this.messageService.question('Remover Pagamento', 'Deseja remover este pagamento?');
    if (!confirmed) return;

    if (pagamento.id) {
      this.atendimentoService.removePagamento(this.atendimentoId()!, pagamento.id).subscribe({
        next: () => this.pagamentos.update(list => list.filter((_, i) => i !== index))
      });
    } else {
      this.pagamentos.update(list => list.filter((_, i) => i !== index));
    }
  }

  // --- Salvar ---

  public async salvar(): Promise<void> {
    if (!this.isAberto()) {
      this.messageService.show('warning', 'Atenção', 'Não é possível alterar um atendimento com status ' + this.getStatusLabel() + '.');
      return;
    }

    if (!this.clienteId()) {
      this.messageService.show('warning', 'Validação', 'Selecione um cliente.');
      return;
    }

    if (!this.form.get('dataConsulta')?.value) {
      this.messageService.show('warning', 'Validação', 'Informe a data da consulta.');
      return;
    }

    if (!this.selectedItems().length) {
      this.messageService.show('warning', 'Validação', 'Adicione ao menos um procedimento na aba Procedimentos.');
      return;
    }

    if (!this.clinicaId()) {
      this.messageService.show('warning', 'Validação', 'Nenhuma clínica associada. Adicione um procedimento primeiro.');
      return;
    }

    const dataConsulta: Date = this.form.get('dataConsulta')!.value;
    const dataFormatada = this.datePipe.transform(dataConsulta, 'yyyy-MM-dd') || '';

    const request: AtendimentoRequest = {
      dataConsultaExame: dataFormatada,
      codCliente: this.clienteId()!,
      codClinica: this.clinicaId()!,
      parcelas: this.parcelas(),
      itens: this.selectedItems().map(i => ({
        codMedico: i.codMedico,
        codMedicalProcedure: i.codMedicalProcedure,
        transferValue: i.transferValue,
        price: i.price,
        transferValueCard: i.transferValueCard,
        priceCard: i.priceCard
      }))
    };

    const op$ = this.atendimentoId()
      ? this.atendimentoService.update(this.atendimentoId()!, request)
      : this.atendimentoService.save(request);

    op$.subscribe({
      next: (res: AtendimentoResponse) => {
        this.messageService.show('success', 'Sucesso', 'Atendimento salvo com sucesso!');
        this.atendimentoId.set(res.id);
        this.dataEmissao.set(res.dataEmissao);
        this.status.set(res.status);
        this.parcelas.set(res.parcelas ?? 1);
      }
    });
  }

  // --- Finalizar ---

  public async finalizar(): Promise<void> {
    if (!this.atendimentoId()) {
      this.messageService.show('warning', 'Atenção', 'Salve o atendimento antes de finalizar.');
      return;
    }

    const confirmed = await this.messageService.question(
      'Finalizar Atendimento',
      'Deseja finalizar este atendimento? Após finalizado não será possível fazer alterações.'
    );
    if (!confirmed) return;

    this.atendimentoService.finalizar(this.atendimentoId()!).subscribe({
      next: (res) => {
        this.status.set(res.status);
        this.form.disable();
        this.pagamentoForm.disable();
        this.messageService.show('success', 'Sucesso', 'Atendimento finalizado com sucesso!');
      }
    });
  }

  // --- Excluir ---

  public async excluir(): Promise<void> {
    if (!this.atendimentoId()) return;

    if (!this.isAberto()) {
      this.messageService.show('warning', 'Atenção', 'Não é possível excluir um atendimento com status ' + this.getStatusLabel() + '.');
      return;
    }

    const confirmed = await this.messageService.question(
      'Excluir Atendimento',
      `Deseja realmente excluir o atendimento #${this.atendimentoId()}? Esta ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    this.atendimentoService.delete(this.atendimentoId()!).subscribe({
      next: () => {
        this.messageService.show('success', 'Sucesso', `Atendimento #${this.atendimentoId()} excluído com sucesso.`);
        this.resetForm();
      }
    });
  }

  // --- Print ---

  public print(tipo: 'guia' | 'recibo'): void {
    const id = this.atendimentoId();
    if (!id) {
      this.messageService.show('warning', 'Atenção', 'Salve o atendimento antes de imprimir.');
      return;
    }

    this.loadingPrint.set(true);
    const request$ = tipo === 'recibo'
      ? this.atendimentoService.getRecibo(id)
      : this.atendimentoService.getEncaminhamento(id);

    request$.subscribe({
      next: (response) => {
        const blob = response.body!;
        const filename = this.extractFilename(response.headers.get('content-disposition'), tipo, id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        this.loadingPrint.set(false);
      },
      error: () => this.loadingPrint.set(false)
    });
  }

  private extractFilename(disposition: string | null, tipo: 'guia' | 'recibo', id: number): string {
    if (disposition) {
      const match = disposition.match(/filename=([^;]+)/i);
      if (match) return match[1].trim();
    }
    return tipo === 'recibo' ? `recibo-${id}.pdf` : `encaminhamento-${id}.pdf`;
  }

  // --- Helpers ---

  public formatDataEmissao(): string {
    if (!this.dataEmissao()) return '---';
    const d = new Date(this.dataEmissao()!);
    return this.datePipe.transform(d, 'dd/MM/yyyy HH:mm') || '---';
  }

  public getStatusLabel(): string {
    return this.status() === 'ABERTO' ? 'Aberto' : 'Encaminhado';
  }

  public getStatusClass(): string {
    return this.status() === 'ABERTO'
      ? 'bg-verde-teal/10 text-verde-teal border border-verde-teal/30'
      : 'bg-azul-prisma/10 text-azul-prisma border border-azul-prisma/30';
  }

  public getTipoPagamentoLabel(tipo: TipoPagamento): string {
    const map: Record<TipoPagamento, string> = {
      DINHEIRO: 'Dinheiro',
      CARTAO_CREDITO: 'Cartão de Crédito',
      CARTAO_DEBITO: 'Cartão de Débito',
      PIX: 'PIX'
    };
    return map[tipo] ?? tipo;
  }
}
