import { Component, inject, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';
import { ClientService } from '../../../core/services/client/client.service';
import { CepService } from '../../../core/services/cep.service';
import { MessageService } from '../../../core/services/message.service';
import { LoadingService } from '../../../core/services/loading.service';
import { cpfValidator } from '../../../core/utils/cpf.validator';
import { DatePickerModule } from 'primeng/datepicker';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS, DatePickerModule],
  providers: [DatePipe],
  templateUrl: './client-form.component.html'
})
export class ClientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  private readonly cepService = inject(CepService);
  private readonly messageService = inject(MessageService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly datePipe = inject(DatePipe);

  @ViewChild('numeroInput') numeroInput!: ElementRef;
  @ViewChild('logradouroInput') logradouroInput!: ElementRef;
  @ViewChild('nameInput') nameInput!: ElementRef;

  public clientForm!: FormGroup;
  public clientId = signal<number | null>(null);

  public biologicalSexOptions = [
    { label: 'Masculino', value: 'MASCULINO' },
    { label: 'Feminino', value: 'FEMININO' }
  ];

  public orientationOptions = [
    { label: 'Não Informado', value: 'NAO_INFORMADO' },
    { label: 'Cisgênero', value: 'CIS' },
    { label: 'Transgênero', value: 'TRANS' },
    { label: 'Não Binário', value: 'NAO_BINARIO' }
  ];

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.clientId.set(Number(id));
      this.loadClientData(this.clientId()!);
    }
  }

  private initForm(): void {
    this.clientForm = this.fb.group({
      cpf: ['', [Validators.required, cpfValidator()]], // Starts with CPF as checkpoint
      name: ['', Validators.required],
      socialName: [''],
      birthDate: [null, Validators.required],
      rg: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.email]],
      biologicalSex: [null, Validators.required],
      sexualOrientation: ['NAO_INFORMADO'],
      firstAppointmentDate: [{ value: null, disabled: true }],
      lastAppointmentDate: [{ value: null, disabled: true }],
      address: this.fb.group({
        cep: ['', Validators.required],
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        bairro: ['', Validators.required],
        complemento: [''],
        cidade: ['', Validators.required],
        uf: ['', Validators.required]
      })
    });
  }

  /**
   * Logic for CPF validation and redirect (Upsert Strategy)
   */
  public checkCpf(): void {
    const cpfControl = this.clientForm.get('cpf');
    
    // 1. Check if empty or already editing a loaded record
    if (!cpfControl?.value || this.clientId()) return;

    // 2. Client-side algorithm validation
    if (cpfControl.invalid) {
      this.messageService.show('error', 'CPF Inválido', 'O número de CPF informado não é válido.');
      cpfControl.setValue('');
      return;
    }

    // 3. API Search
    this.clientService.getByCpf(cpfControl.value).subscribe({
      next: (client) => {
        this.messageService.show('info', 'Cliente Encontrado', 'Redirecionando para edição dos dados.');
        // Redirect to the edit route of the found client
        this.router.navigate(['/clients', client.id, 'edit']);
      },
      error: () => {
        // Not found is fine, user continues new registration
        setTimeout(() => {
          this.nameInput.nativeElement.focus();
        }, 100);
      }
    });
  }

  private loadClientData(id: number): void {
    this.loadingService.show();
    this.clientService.findById(id).subscribe({
      next: (client) => {
        let birthDateObj: Date | null = null;
        if (client.birthDate) {
          const parts = client.birthDate.split('-');
          if (parts.length === 3) {
            birthDateObj = new Date(+parts[0], +parts[1] - 1, +parts[2]);
          }
        }

        const firstFormatted = client.firstAppointmentDate
          ? (this.datePipe.transform(client.firstAppointmentDate, 'dd/MM/yyyy HH:mm') ?? '')
          : '---';
        const lastFormatted = client.lastAppointmentDate
          ? (this.datePipe.transform(client.lastAppointmentDate, 'dd/MM/yyyy HH:mm') ?? '')
          : '---';

        this.clientForm.patchValue({
          ...client,
          birthDate: birthDateObj,
          firstAppointmentDate: firstFormatted,
          lastAppointmentDate: lastFormatted
        });
        this.loadingService.hide();
      },
      error: () => this.loadingService.hide()
    });
  }

  public handleCepKeydown(event: any): void {
  // Check if it's the Enter key
    if (event.key === 'Enter') {
      event.preventDefault(); // Stop form submission
      event.stopPropagation(); // Stop event bubbling
      this.findCep();
    }
  }

  public findCep(): void {
    const cep = this.clientForm.get('address.cep')?.value?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;

    this.loadingService.show();
    this.cepService.getAddressByCep(cep).subscribe({
      next: (res) => {
        this.loadingService.hide();
        if (res) {
          // Mapping ViaCEP response to our local form structure
          this.clientForm.get('address')?.patchValue({
            logradouro: res.logradouro,
            bairro: res.bairro,
            cidade: res.localidade, // Maps 'localidade' to 'cidade'
            uf: res.uf
          });
          // Focus on "Number" field as the address was successfully filled
          setTimeout(() => this.numeroInput.nativeElement.focus(), 100);
        } else {
          // If null (not found or error), clear and focus on logradouro for manual input
          setTimeout(() => this.logradouroInput.nativeElement.focus(), 100);
        }
      },
      error: () => this.loadingService.hide()
    });
  }

  public onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();

    const formValue = { ...this.clientForm.getRawValue() };

    if (formValue.address && formValue.address.cep) {
      formValue.address.cep = formValue.address.cep.replace(/\D/g, '');
    }

    if (formValue.birthDate instanceof Date) {
      formValue.birthDate = this.datePipe.transform(formValue.birthDate, 'yyyy-MM-dd');
    }

    const request$ = this.clientId()
      ? this.clientService.update(this.clientId()!, formValue)
      : this.clientService.save(formValue);

    request$.subscribe({
      next: () => {
        this.loadingService.hide();
        this.messageService.show('success', 'Sucesso', `Cliente ${this.clientId() ? 'atualizado' : 'cadastrado'} com sucesso!`);
        this.router.navigate(['/clients']);
      },
      error: (err) => {
        this.loadingService.hide();
        this.messageService.show('error', 'Erro', err.error?.message || 'Erro ao processar solicitação.');
      }
    });
  }

  public onDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    let value = input.value.replace(/\D/g, ''); // Keep only digits
    if (value.length > 8) value = value.substring(0, 8);

    let formatted = '';
    if (value.length > 0) {
      formatted += value.substring(0, 2);
    }
    if (value.length > 2) {
      formatted += '/' + value.substring(2, 4);
    }
    if (value.length > 4) {
      formatted += '/' + value.substring(4, 8);
    }

    input.value = formatted;
  }

  public cancel(): void {
    this.router.navigate(['/clients']);
  }
}