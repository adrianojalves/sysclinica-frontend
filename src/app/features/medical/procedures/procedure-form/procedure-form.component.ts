import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SHARED_UI_IMPORTS } from '../../../../shared/imports/shared-ui.imports';
import { MedicalProcedureService } from '../../../../core/services/medical/procedure.service';
import { MessageService } from '../../../../core/services/message.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { STATUS_OPTIONS } from '../../../../shared/constants/ui.constants';
import { ProcedureType } from '../../../../core/models/medical/procedure.model';

@Component({
  selector: 'app-procedure-form',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './procedure-form.component.html'
})
export class ProcedureFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly procedureService = inject(MedicalProcedureService);
  private readonly messageService = inject(MessageService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public procedureForm!: FormGroup;
  public procedureId = signal<number | null>(null);
  
  // UI Options
  public readonly statusOptions = STATUS_OPTIONS;
  public readonly typeOptions = [
    { label: 'Exame', value: ProcedureType.EXAME },
    { label: 'Consulta', value: ProcedureType.CONSULTA }
  ];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.procedureForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      type: [ProcedureType.EXAME, [Validators.required]],
      active: [true]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.procedureId.set(Number(id));
      this.loadProcedureToEdit(this.procedureId()!);
    }
  }

  private loadProcedureToEdit(id: number): void {
    this.loadingService.show();
    this.procedureService.findById(id).subscribe({
      next: (proc) => {
        this.procedureForm.patchValue(proc);
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.messageService.show('error', 'Error', 'Failed to load procedure data.');
        this.router.navigate(['/procedures']);
      }
    });
  }

  public onSubmit(): void {
    if (this.procedureForm.invalid) {
      this.procedureForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();
    const payload = { ...this.procedureForm.value };

    // If it's a new record, we don't send the 'active' field
    if (!this.procedureId()) {
      delete payload.active;
    }

    const request$ = this.procedureId()
      ? this.procedureService.update(this.procedureId()!, payload)
      : this.procedureService.save(payload);

    request$.subscribe({
      next: () => {
        this.loadingService.hide();
        this.messageService.show('success', 'Success', `Procedimento ${this.procedureId() ? 'atualizado' : 'criado'} com sucesso!`);
        this.router.navigate(['/procedures']);
      },
      error: (err) => {
        this.loadingService.hide();
        this.handleApiError(err);
      }
    });
  }

  private handleApiError(err: any): void {
    if (err.status === 400 && err.error) {
      if (Array.isArray(err.error)) {
        err.error.forEach((apiErr: any) => this.messageService.show('error', 'Atenção', apiErr.message));
      } else if (err.error.message) {
        this.messageService.show('error', 'Atenção', err.error.message);
      }
    } else {
      this.messageService.show('error', 'Error', 'Ocorreu um erro ao processar a requisição.');
    }
  }

  public cancel(): void {
    this.router.navigate(['/procedures']);
  }
}