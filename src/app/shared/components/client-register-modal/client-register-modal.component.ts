import { Component, inject, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { SHARED_UI_IMPORTS } from '../../imports/shared-ui.imports';
import { ClientService } from '../../../core/services/client/client.service';
import { CepService } from '../../../core/services/cep.service';
import { MessageService } from '../../../core/services/message.service';
import { cpfValidator } from '../../../core/utils/cpf.validator';
import { Client } from '../../../core/models/client/client.model';

@Component({
  selector: 'app-client-register-modal',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './client-register-modal.component.html'
})
export class ClientRegisterModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  private readonly cepService = inject(CepService);
  private readonly messageService = inject(MessageService);
  private readonly ref = inject(DynamicDialogRef);

  @ViewChild('numeroInput') numeroInput!: ElementRef;
  @ViewChild('logradouroInput') logradouroInput!: ElementRef;
  @ViewChild('nameInput') nameInput!: ElementRef;

  public readonly loading = this.clientService.loading;

  public readonly biologicalSexOptions = [
    { label: 'Masculino', value: 'MASCULINO' },
    { label: 'Feminino', value: 'FEMININO' }
  ];

  public readonly orientationOptions = [
    { label: 'Não Informado', value: 'NAO_INFORMADO' },
    { label: 'Cisgênero', value: 'CIS' },
    { label: 'Transgênero', value: 'TRANS' },
    { label: 'Não Binário', value: 'NAO_BINARIO' }
  ];

  public clientForm: FormGroup = this.fb.group({
    cpf: ['', [Validators.required, cpfValidator()]],
    name: ['', Validators.required],
    socialName: [''],
    rg: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.email]],
    biologicalSex: [null, Validators.required],
    sexualOrientation: ['NAO_INFORMADO'],
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

  public checkCpf(): void {
    const cpfControl = this.clientForm.get('cpf');
    if (!cpfControl?.value) return;

    if (cpfControl.invalid) {
      this.messageService.show('error', 'CPF Inválido', 'O número de CPF informado não é válido.');
      cpfControl.setValue('');
      return;
    }

    this.clientService.getByCpf(cpfControl.value).subscribe({
      next: (client: Client) => {
        this.messageService.show('info', 'Cliente Encontrado', 'CPF já cadastrado. O cliente será selecionado automaticamente.');
        this.ref.close(client);
      },
      error: () => {
        setTimeout(() => this.nameInput?.nativeElement?.focus(), 100);
      }
    });
  }

  public handleCepKeydown(event: any): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.findCep();
    }
  }

  public findCep(): void {
    const cep = this.clientForm.get('address.cep')?.value?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;

    this.cepService.getAddressByCep(cep).subscribe({
      next: (res) => {
        if (res) {
          this.clientForm.get('address')?.patchValue({
            logradouro: res.logradouro,
            bairro: res.bairro,
            cidade: res.localidade,
            uf: res.uf
          });
          setTimeout(() => this.numeroInput?.nativeElement?.focus(), 100);
        } else {
          setTimeout(() => this.logradouroInput?.nativeElement?.focus(), 100);
        }
      }
    });
  }

  public onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const formValue = { ...this.clientForm.value };
    if (formValue.address?.cep) {
      formValue.address.cep = formValue.address.cep.replace(/\D/g, '');
    }

    this.clientService.save(formValue).subscribe({
      next: (client: Client) => {
        this.messageService.show('success', 'Sucesso', 'Cliente cadastrado com sucesso!');
        this.ref.close(client);
      },
      error: (err) => {
        this.messageService.show('error', 'Erro', err.error?.message || 'Erro ao cadastrar cliente.');
      }
    });
  }

  public cancel(): void {
    this.ref.close(null);
  }
}
