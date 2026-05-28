import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';
import { DatePickerModule } from 'primeng/datepicker';
import { SplitButtonModule } from 'primeng/splitbutton';
import { AtendimentoService } from '../../../core/services/atendimento/atendimento.service';
import { ClinicProcedureService } from '../../../core/services/medical/clinic-procedure.service';
import { MessageService } from '../../../core/services/message.service';
import { SearchDialogService } from '../../../core/services/common/search-dialog.service';
import { ClientSearchModalComponent } from '../../../shared/components/client-search-modal/client-search-modal.component';
import { AtendimentoSearchModalComponent } from '../atendimento-search-modal/atendimento-search-modal.component';
import {
  AtendimentoResponse,
  AtendimentoRequest,
  AtendimentoItemLocal,
  TipoPagamento
} from '../../../core/models/atendimento/atendimento.model';
import { Client } from '../../../core/models/client/client.model';
import { ClinicDoctorProcedure, ClinicDoctorProcedureFilter } from '../../../core/models/medical/clinic-procedure.model';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-atendimento-form',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS, DatePickerModule, SplitButtonModule],
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
  private readonly datePipe = inject(DatePipe);

  // --- State ---
  public form!: FormGroup;
  public activeTabIndex = signal<number>(0);

  public atendimentoId = signal<number | null>(null);
  public dataEmissao = signal<string | null>(null);
  public status = signal<string>('ABERTO');

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

  // Computed totals
  public isCartao = computed(() => {
    const tipo = this.form?.get('tipoPagamento')?.value as TipoPagamento;
    return tipo === 'CARTAO_CREDITO' || tipo === 'CARTAO_DEBITO';
  });

  public isCreditCard = computed(() => {
    return this.form?.get('tipoPagamento')?.value === 'CARTAO_CREDITO';
  });

  public totalValor = computed(() => {
    const items = this.selectedItems();
    if (this.isCartao()) {
      return items.reduce((sum, i) => sum + (i.priceCard || 0), 0);
    }
    return items.reduce((sum, i) => sum + (i.price || 0), 0);
  });

  public hasItems = computed(() => this.selectedItems().length > 0);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      dataConsulta: [null, Validators.required],
      tipoPagamento: ['DINHEIRO', Validators.required],
      parcelas: [1, [Validators.required, Validators.min(1)]]
    });

    this.form.get('tipoPagamento')?.valueChanges.subscribe(val => {
      if (val !== 'CARTAO_CREDITO') {
        this.form.get('parcelas')?.setValue(1);
      }
    });
  }

  // --- Top actions ---

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
    this.dataEmissao.set(null);
    this.status.set('ABERTO');
    this.clienteId.set(null);
    this.clienteNome.set('');
    this.clinicaId.set(null);
    this.clinicaNome.set('');
    this.selectedItems.set([]);
    this.procedureResults.set([]);
    this.procedureSearched.set(false);
    this.form.reset({ tipoPagamento: 'DINHEIRO', parcelas: 1 });
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

    const dateParts = atendimento.dataConsultaExame?.split('-');
    const dateObj = dateParts
      ? new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2])
      : null;

    this.form.patchValue({
      dataConsulta: dateObj,
      tipoPagamento: atendimento.tipoPagamento,
      parcelas: atendimento.parcelas || 1
    });

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

    this.activeTabIndex.set(0);
  }

  // --- Tab 1: Client search ---

  public openClientSearch(): void {
    this.searchService.open<Client>(ClientSearchModalComponent, 'Pesquisar Cliente')
      .subscribe(client => {
        if (client) {
          this.clienteId.set(client.id);
          this.clienteNome.set(client.name);
        }
      });
  }

  // --- Tab 2: Procedure search ---

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
      this.messageService.show('warning', 'Atenção', 'Este procedimento com o mesmo médico já foi adicionado.');
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
  }

  // --- Tab 3: Remove procedure ---

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

  // --- Save ---

  public async salvar(): Promise<void> {
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
      tipoPagamento: this.form.get('tipoPagamento')!.value,
      parcelas: this.isCreditCard() ? (this.form.get('parcelas')!.value || 1) : 1,
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
      }
    });
  }

  // --- Print ---

  public print(tipo: 'guia' | 'recibo'): void {
    const labels = {
      guia: 'Guia de Encaminhamento',
      recibo: 'Recibo de Pagamento'
    };
    console.log(`[Imprimir] ${labels[tipo]} - Atendimento ID: ${this.atendimentoId() ?? 'Novo'}`);
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
}
