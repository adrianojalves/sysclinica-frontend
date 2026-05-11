import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClinicService } from '../../../../core/services/medical/clinic.service';
import { ClinicProcedureService } from '../../../../core/services/medical/clinic-procedure.service';
import { CepService } from '../../../../core/services/cep.service';
import { MessageService } from '../../../../core/services/message.service';
import { SearchDialogService } from '../../../../core/services/common/search-dialog.service';
import { DoctorSearchModalComponent } from '../../../../shared/components/doctor-search-modal/doctor-search-modal.component';
import { ProcedureSearchModalComponent } from '../../../../shared/components/procedure-search-modal/procedure-search-modal.component';
import { Doctor } from '../../../../core/models/medical/doctor.model';
import { ClinicDoctorProcedure, ClinicDoctorProcedureFilter } from '../../../../core/models/medical/clinic-procedure.model';
import { SHARED_UI_IMPORTS } from '../../../../shared/imports/shared-ui.imports';
import { STATUS_OPTIONS } from '../../../../shared/constants/ui.constants';
import { MedicalProcedure } from '../../../../core/models/medical/procedure.model';

@Component({
  selector: 'app-clinic-form',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './clinic-form.component.html',
  styleUrl: './clinic-form.component.scss'
})
export class ClinicFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clinicService = inject(ClinicService);
  private readonly clinicProcService = inject(ClinicProcedureService);
  private readonly cepService = inject(CepService);
  private readonly messageService = inject(MessageService);
  private readonly searchService = inject(SearchDialogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('numInput') numInput!: ElementRef;
  @ViewChild('logInput') logInput!: ElementRef;

  public clinicForm!: FormGroup;
  public procForm!: FormGroup;
  public clinicId = signal<number | null>(null);
  public editingProcId = signal<number | null>(null);
  public procedures = signal<ClinicDoctorProcedure[]>([]);
  public readonly statusOptions = STATUS_OPTIONS;

public totalRecords = signal<number>(0);
public rows = signal<number>(10);
public currentPage = signal<number>(0);

  ngOnInit(): void {
    this.initForms();
    this.checkEditMode();
  }

  private initForms(): void {
    this.clinicForm = this.fb.group({
      name: ['', [Validators.required]],
      cnpj: ['', [Validators.required]],
      fone1: ['', [Validators.required]],
      fone2: [''],
      site: [''],
      email: ['', [Validators.required, Validators.email]],
      percentual: [0, [Validators.min(0), Validators.max(100)]],
      active: [true],
      address: this.fb.group({
        cep: ['', [Validators.required]],
        logradouro: ['', [Validators.required]],
        bairro: ['', [Validators.required]],
        cidade: ['', [Validators.required]],
        uf: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        complemento: ['']
      })
    });

    this.procForm = this.fb.group({
      doctorId: [null, [Validators.required]],
      doctorName: [{ value: '', disabled: true }],
      medicalProcedureId: [null, [Validators.required]],
      procedureName: [{ value: '', disabled: true }],
      transferValue: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.clinicId.set(Number(id));
      this.loadClinic();
    }
  }

  public selectOnFocus(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.select) {
      inputElement.select();
    }
  }

  // --- TAB 1: General Data ---

  public onCnpjBlur(): void {
    const cnpj = this.clinicForm.get('cnpj')?.value;
    if (this.clinicId() || !cnpj) return;

    this.clinicService.checkCnpjExists(cnpj).subscribe(exists => {
      if (exists) {
        this.messageService.show('warning', 'Atenção', 'Este CNPJ já está cadastrado no sistema.');
        this.clinicForm.get('cnpj')?.setValue('');
      }
    });
  }

  public onCepEnter(): void {
    const cepValue = this.clinicForm.get('address.cep')?.value;
    
    if (!cepValue || cepValue.length !== 8) return;

    this.cepService.getAddressByCep(cepValue).subscribe({
      next: (res) => {
        // Check if result is valid and not an error from ViaCep
        if (res && !res.erro) {
          this.clinicForm.get('address')?.patchValue({
            logradouro: res.logradouro,
            bairro: res.bairro,
            cidade: res.localidade,
            uf: res.uf
          });
          // Found: Jump to Number
          setTimeout(() => this.numInput.nativeElement.focus(), 100);
        } else {
          // Not found: Jump to Street/Logradouro
          setTimeout(() => this.logInput.nativeElement.focus(), 100);
        }
      },
      error: () => {
        // On API error, also jump to Street to allow manual entry
        setTimeout(() => this.logInput.nativeElement.focus(), 100);
      }
    });
  }

  public onSubmitClinic(): void {
    if (this.clinicForm.invalid) return;

    const request$ = this.clinicId() 
      ? this.clinicService.update(this.clinicId()!, this.clinicForm.value)
      : this.clinicService.save(this.clinicForm.value);

    request$.subscribe({
      next: (res: any) => {
        this.messageService.show('success', 'Sucesso', 'Clínica salva com sucesso!');
        if (!this.clinicId()) {
          this.router.navigate(['/clinics', res.id]);
        }
      }
    });
  }

  // --- TAB 2: Procedures ---

  public openDoctorSearch(): void {
    this.searchService.open<Doctor>(DoctorSearchModalComponent, 'Pesquisar Médico')
      .subscribe(doc => {
        if (doc) {
          this.procForm.patchValue({ doctorId: doc.id, doctorName: doc.name });
        }
      });
  }

  public openProcedureSearch(): void {
    this.searchService.open<MedicalProcedure>(ProcedureSearchModalComponent, 'Pesquisar Procedimento')
      .subscribe(proc => {
        if (proc) {
          this.procForm.patchValue({ medicalProcedureId: proc.id, procedureName: proc.name });
        }
      });
  }

 /**
 * Load procedures using server-side pagination
 * @param page Current page index
 * @param size Number of records per page
 */
  public loadClinicProcedures(page: number = 0, size: number = 10): void {
    const filter: ClinicDoctorProcedureFilter = {
      clinicId: this.clinicId()!
    };

    this.clinicProcService.list(filter, page, size).subscribe({
      next: (res: any) => {
        this.procedures.set(res.content);
        
        if (res.page) {
          this.totalRecords.set(res.page.totalElements);
        }
      },
      error: (err) => {
        console.error('Error loading procedures', err);
        this.procedures.set([]);
        this.totalRecords.set(0);
      }
    });
  }

  public onPageChange(event: any): void {
    const page = event.first / event.rows;
    const size = event.rows;

    this.currentPage.set(page);
    this.rows.set(size);

    if (this.clinicId()) {
      this.loadClinicProcedures(page, size);
    }
  }

  public saveProcedure(): void {
    if (this.procForm.invalid) return;

    const data: ClinicDoctorProcedure = {
      ...this.procForm.getRawValue(),
      clinicId: this.clinicId()!
    };

    const request$ = this.editingProcId()
      ? this.clinicProcService.update(this.editingProcId()!, data)
      : this.clinicProcService.save(data);

    request$.subscribe({
      next: () => {
        this.messageService.show('success', 'Sucesso', 'Associação salva!');
        this.resetProcForm();
        this.loadClinicProcedures();
      }
    });
  }

  public editProc(item: ClinicDoctorProcedure): void {
    this.editingProcId.set(item.id!);
    this.procForm.patchValue(item);
  }

  public async deleteProc(id: number): Promise<void> {
    const confirmed = await this.messageService.question(
      'Confirmar Exclusão', 
      'Deseja realmente remover esta associação de procedimento?'
    );

    if (confirmed) {
      this.clinicProcService.delete(id).subscribe({
        next: () => {
          this.messageService.show('success', 'Sucesso', 'Removido com sucesso');
          this.loadClinicProcedures();
        },
        error: () => this.messageService.show('error', 'Erro', 'Falha ao remover procedimento.')
      });
    }
  }

  public resetProcForm(): void {
    this.editingProcId.set(null);
    this.procForm.reset({ transferValue: 0, price: 0 });
  }

  private loadClinic(): void {
    this.clinicService.findById(this.clinicId()!).subscribe(res => this.clinicForm.patchValue(res));
  }

  public cancel(): void {
    this.router.navigate(['/clinics']);
  }
}