import { Component, inject, signal } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ClientService } from '../../../core/services/client/client.service';
import { Client, ClientFilter } from '../../../core/models/client/client.model';
import { SHARED_UI_IMPORTS } from '../../imports/shared-ui.imports';

@Component({
  selector: 'app-client-search-modal',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './client-search-modal.component.html'
})
export class ClientSearchModalComponent {
  private readonly clientService = inject(ClientService);
  private readonly ref = inject(DynamicDialogRef);

  public clients = signal<Client[]>([]);
  public loading = signal<boolean>(false);
  public searchName = signal<string>('');
  public hasSearched = signal<boolean>(false);

  public search(): void {
    const name = this.searchName().trim();
    if (!name) return;

    this.loading.set(true);
    const filter: ClientFilter = { name };

    this.clientService.findFiltered(0, 20, filter).subscribe({
      next: (res) => {
        this.clients.set(res.content);
        this.hasSearched.set(true);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  public selectClient(client: Client): void {
    this.ref.close(client);
  }
}
