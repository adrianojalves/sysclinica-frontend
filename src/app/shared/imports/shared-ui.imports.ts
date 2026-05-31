import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrlCurrencyPipe } from '../pipes/brl-currency.pipe';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';

/**
 * Centralized array of commonly used UI modules for Standalone Components.
 * This array prevents repetitive imports across the application, keeping
 * the component decorator clean and maintainable.
 */
export const SHARED_UI_IMPORTS = [
  BrlCurrencyPipe,
  ButtonModule,
  CommonModule,
  DropdownModule,
  FileUploadModule,
  FloatLabelModule,
  FormsModule,
  InputMaskModule,
  InputNumberModule,
  InputTextarea,
  InputTextModule,
  ListboxModule,
  ReactiveFormsModule,
  RouterModule,
  TableModule,
  TabViewModule
] as const;