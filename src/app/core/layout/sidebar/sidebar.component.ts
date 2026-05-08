import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../layout.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  public layoutService = inject(LayoutService);
  public authService = inject(AuthService);

  // State variables to control the visibility of submenus
  isCadastrosOpen = false;
  isRelatoriosOpen = false;

  // Methods to toggle the menu states
  toggleCadastros(): void {
    this.isCadastrosOpen = !this.isCadastrosOpen;
  }

  toggleRelatorios(): void {
    this.isRelatoriosOpen = !this.isRelatoriosOpen;
  }
}
