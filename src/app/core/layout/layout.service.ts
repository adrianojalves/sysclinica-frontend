import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  // Angular 19 Signal to manage the mobile sidebar state reactively
  isMobileSidebarOpen = signal<boolean>(false);

  // Method to toggle the state between true and false
  toggleSidebar(): void {
    this.isMobileSidebarOpen.update(state => !state);
  }
}
