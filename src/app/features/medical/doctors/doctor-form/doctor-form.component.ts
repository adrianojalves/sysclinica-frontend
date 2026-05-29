import { Component, inject, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SHARED_UI_IMPORTS } from '../../../../shared/imports/shared-ui.imports';
import { CepService } from '../../../../core/services/cep.service';
import { MessageService } from '../../../../core/services/message.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { DoctorService } from '../../../../core/services/medical/doctor.service';
import { STATUS_OPTIONS } from '../../../../shared/constants/ui.constants';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './doctor-form.component.html'
})
export class DoctorFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly doctorService = inject(DoctorService);
  private readonly cepService = inject(CepService);
  private readonly messageService = inject(MessageService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  @ViewChild('numeroInput') numeroInput!: ElementRef;
  @ViewChild('logradouroInput') logradouroInput!: ElementRef;

  public doctorForm!: FormGroup;
  public doctorId = signal<number | null>(null);
  public readonly statusOptions = STATUS_OPTIONS;

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.doctorForm = this.fb.group({
      name: ['', [Validators.required]],
      crm: ['', [Validators.required]],
      status: [true],
      address: this.fb.group({
        cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
        logradouro: ['', [Validators.required]],
        bairro: ['', [Validators.required]],
        cidade: ['', [Validators.required]],
        uf: ['', [Validators.required, Validators.maxLength(2)]],
        numero: ['', [Validators.required]],
        complemento: ['']
      })
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.doctorId.set(Number(id));
      this.loadDoctor(this.doctorId()!);
    }
  }

  private loadDoctor(id: number): void {
    this.loadingService.show();
    this.doctorService.findById(id).subscribe({
      next: (doc) => {
        this.doctorForm.patchValue(doc);
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.messageService.show('error', 'Erro', 'Falha ao carregar dados do médico.');
        this.router.navigate(['/doctors']);
      }
    });
  }

  public onCepEnter(): void {
    const cep = this.doctorForm.get('address.cep')?.value;
    if (!cep || cep.length !== 8) return;

    this.loadingService.show();
    this.cepService.getAddressByCep(cep).subscribe({
      next: (res) => {
        this.loadingService.hide();
        if (res) {
          this.doctorForm.get('address')?.patchValue({
            logradouro: res.logradouro,
            bairro: res.bairro,
            cidade: res.localidade,
            uf: res.uf
          });
          // Focus on "Number" field if CEP was found
          setTimeout(() => this.numeroInput.nativeElement.focus(), 100);
        } else {
          // Focus on "Logradouro" if CEP was NOT found
          setTimeout(() => this.logradouroInput.nativeElement.focus(), 100);
        }
      },
      error: () => this.loadingService.hide()
    });
  }

  public onSubmit(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();
    const request$ = this.doctorId()
      ? this.doctorService.update(this.doctorId()!, this.doctorForm.value)
      : this.doctorService.save(this.doctorForm.value);

    request$.subscribe({
      next: () => {
        this.loadingService.hide();
        this.messageService.show('success', 'Sucesso', `Médico ${this.doctorId() ? 'atualizado' : 'cadastrado'} com sucesso!`);
        this.router.navigate(['/doctors']);
      },
      error: (err) => {
        this.loadingService.hide();
        this.handleError(err);
      }
    });
  }

  private handleError(err: any): void {
    // Standardized error message handling in Portuguese
    const msg = err.error?.[0]?.message || err.error?.message || 'Erro ao processar requisição.';
    this.messageService.show('error', 'Atenção', msg);
  }

  public cancel(): void {
    this.router.navigate(['/doctors']);
  }
}