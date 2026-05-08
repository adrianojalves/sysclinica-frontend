import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule], // Required for [formGroup]
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  // Defining the reactive form with basic validation for seniors (clear inputs)
  loginForm = this.fb.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.getRawValue() as any;
      
      // Attempt to login through the service
      this.authService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(['/']); // Success: go to Dashboard
        },
        error: (err) => {
          console.error('Login failed', err);
          this.messageService.show(
            'error', 
            'Acesso Negado', 
            'Usuário ou senha inválidos. Por favor, tente novamente.'
          );
        }
      });
    }
  }
}