import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '../layout.service';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  // Injecting services using the modern Angular 19 'inject' function
  public layoutService = inject(LayoutService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  /**
   * Handles the logout process with a confirmation modal
   */
  async onLogout(): Promise<void> {
    // Using our custom message service to ask for confirmation
    const confirmed = await this.messageService.question(
      'Sair do Sistema', 
      'Deseja realmente encerrar sua sessão no SysClinica?'
    );

    if (confirmed) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}