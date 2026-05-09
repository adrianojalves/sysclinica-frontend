import { Component, inject, OnInit, signal } from '@angular/core';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';
import { UserService } from '../../../core/services/users/user.service';
import { MessageService } from '../../../core/services/message.service';
import { User } from '../../../core/models/users/user.model';
import { TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    ...SHARED_UI_IMPORTS
  ],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);

  // State Signals
  public users = signal<User[]>([]);
  public totalRecords = signal<number>(0);
  public isLoading = this.userService.loading;
  
  // Filter and Pagination State
  public searchQuery = signal<string>('');
  private currentPage = 0;
  private currentSize = 10;

  // Options for the Status Dropdown
  public statusOptions = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false }
  ];

  ngOnInit(): void {
    // Initial load happens via PrimeNG's onLazyLoad event
  }

  /**
   * Triggered by PrimeNG table on pagination, sorting, or initial load.
   */
  loadUsers(event: TableLazyLoadEvent): void {
    this.currentPage = event.first ? event.first / (event.rows || 10) : 0;
    this.currentSize = event.rows || 10;
    this.fetchData();
  }

  /**
   * Triggered by the search button or pressing Enter.
   */
  onSearch(): void {
    this.currentPage = 0; // Reset to first page on new search
    this.fetchData();
  }

  /**
   * Centralized method to call the service.
   */
  private fetchData(): void {
    this.userService.findPaginated(this.currentPage, this.currentSize, this.searchQuery()).subscribe({
      next: (pageData) => {
        this.users.set(pageData.content);
        this.totalRecords.set(pageData.totalElements);
      },
      error: () => {
        this.messageService.show('error', 'Erro', 'Não foi possível carregar a lista de usuários.');
      }
    });
  }

  /**
   * Triggered immediately when the dropdown value changes.
   */
  onStatusChange(user: User): void {
    this.userService.updateStatus(user.id, user.active).subscribe({
      next: () => {
        this.messageService.show('success', 'Sucesso', `Status de ${user.name} atualizado.`);
      },
      error: () => {
        // Revert the visual change if the API fails
        user.active = !user.active; 
        this.messageService.show('error', 'Erro', 'Falha ao atualizar o status.');
      }
    });
  }
}