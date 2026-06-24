import { Component, inject, OnInit, signal } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserService } from '../../../core/services/users/user.service';
import { UserSummary } from '../../../core/models/users/user-summary.model';
import { SHARED_UI_IMPORTS } from '../../imports/shared-ui.imports';

@Component({
  selector: 'app-user-search-modal',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './user-search-modal.component.html'
})
export class UserSearchModalComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly ref = inject(DynamicDialogRef);

  public users = signal<UserSummary[]>([]);
  public loading = signal<boolean>(false);
  public searchTerm = signal<string>('');

  ngOnInit(): void {
    this.search();
  }

  public search(): void {
    this.loading.set(true);
    this.userService.findSummary(0, 50, this.searchTerm()).subscribe({
      next: (response) => {
        this.users.set(response.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  public selectUser(user: UserSummary): void {
    this.ref.close(user);
  }
}
