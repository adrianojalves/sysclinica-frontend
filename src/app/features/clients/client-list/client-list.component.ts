// client-list.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';
import { ClientService } from '../../../core/services/client/client.service';
import { Client, ClientFilter } from '../../../core/models/client/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
  private readonly clientService = inject(ClientService);

  public clients = signal<Client[]>([]);
  public totalRecords = signal<number>(0);
  public loading = this.clientService.loading;
  
  public filterName = signal<string>('');
  public filterCpf = signal<string>('');

  ngOnInit(): void {
    this.loadClients();
  }

  public loadClients(event?: any): void {
    const page = event ? event.first / event.rows : 0;
    const size = event ? event.rows : 10;

    const cpfValue = this.filterCpf()?.trim();
    
    const filter: ClientFilter = {
      name: this.filterName(),
      cpf: cpfValue === '' ? null : cpfValue
    };

    this.clientService.findFiltered(page, size, filter)
      .subscribe(response => {
        this.clients.set(response.content);
        this.totalRecords.set(response.page.totalElements);
      });
  }
}