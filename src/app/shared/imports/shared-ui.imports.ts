import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { TableModule } from 'primeng/table';

/**
 * Centralized array of commonly used UI modules for Standalone Components.
 * This array prevents repetitive imports across the application, keeping
 * the component decorator clean and maintainable.
 */
export const SHARED_UI_IMPORTS = [
  ButtonModule,
  CommonModule,
  DropdownModule,
  FloatLabelModule,
  FormsModule,
  InputMaskModule,
  InputTextModule,
  ListboxModule,
  ReactiveFormsModule,
  RouterModule,
  TableModule
] as const;