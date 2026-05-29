import { Component, inject, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CepService } from '../../../core/services/cep.service';
import { MessageService } from '../../../core/services/message.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Company } from '../../../core/models/company/company.model';
import { environment } from '../../../../environments/environment';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';
import { CompanyService } from '../../../core/services/company/company.service';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './company-form.component.html'
})
export class CompanyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly cepService = inject(CepService);
  private readonly messageService = inject(MessageService);
  private readonly loadingService = inject(LoadingService);

  @ViewChild('numInput') numInput!: ElementRef;
  @ViewChild('logInput') logInput!: ElementRef;

  public companyForm!: FormGroup;
  public company = signal<Company | null>(null);
  public logoPreview = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
    this.loadCompany();
  }

  private initForm(): void {
    this.companyForm = this.fb.group({
      corporateName: ['', [Validators.required]],
      tradeName: ['', [Validators.required]],
      cnpj: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      address: this.fb.group({
        cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
        logradouro: ['', [Validators.required]],
        bairro: ['', [Validators.required]],
        cidade: ['', [Validators.required]],
        uf: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        complemento: ['']
      })
    });
  }

  /**
   * Loads the singleton company data from backend
   */
  private loadCompany(): void {
    this.loadingService.show();
    this.companyService.getCompany().subscribe({
      next: (data: Company) => {
        if (data) {
          this.company.set(data);
          this.companyForm.patchValue(data);
          this.refreshLogoUrl();
        }
        this.loadingService.hide();
      },
      error: () => this.loadingService.hide()
    });
  }

  /**
   * Updates the logo preview URL with a timestamp to bypass browser cache
   */
  private refreshLogoUrl(): void {
    this.logoPreview.set(`${environment.apiUrl}/clinica/company/logo?t=${Date.now()}`);
  }

  /**
   * ViaCEP integration with auto-focus logic
   */
  public onCepEnter(): void {
    const cep = this.companyForm.get('address.cep')?.value;
    if (!cep || cep.length !== 8) return;

    this.loadingService.show();
    this.cepService.getAddressByCep(cep).subscribe({
      next: (res) => {
        this.loadingService.hide();
        if (res) {
          this.companyForm.get('address')?.patchValue({
            logradouro: res.logradouro,
            bairro: res.bairro,
            cidade: res.localidade,
            uf: res.uf
          });
          // Focus on "Number" field if CEP was found
          setTimeout(() => this.numInput.nativeElement.focus(), 100);
        } else {
          // Focus on "Logradouro" for manual input if not found
          setTimeout(() => this.logInput.nativeElement.focus(), 100);
        }
      },
      error: () => this.loadingService.hide()
    });
  }

  /**
   * Handles the logo upload only if company ID exists
   */
  public onLogoUpload(event: any): void {
    const file = event.files[0];
    if (!file || !this.company()?.id) return;

    this.loadingService.show();
    this.companyService.uploadLogo(file).subscribe({
      next: (updated: Company) => {
        this.company.set(updated);
        this.refreshLogoUrl();
        this.messageService.show('success', 'Sucesso', 'Logotipo atualizado com sucesso!');
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.messageService.show('error', 'Erro', 'Falha ao processar o upload do logotipo.');
      }
    });
  }

  /**
   * Saves or updates the singleton company info
   */
  public onSubmit(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();
    this.companyService.saveOrUpdate(this.companyForm.value).subscribe({
      next: (saved: Company) => {
        this.company.set(saved);
        this.messageService.show('success', 'Sucesso', 'Dados da clínica salvos com sucesso!');
        this.loadingService.hide();
      },
      error: (err: any) => {
        this.loadingService.hide();
        const msg = err.error?.[0]?.message || 'Erro ao salvar os dados corporativos.';
        this.messageService.show('error', 'Atenção', msg);
      }
    });
  }
}