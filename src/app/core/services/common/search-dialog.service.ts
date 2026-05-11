import { inject, Injectable, Type } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchDialogService {
  private readonly dialogService = inject(DialogService);

  /**
   * Opens a generic search modal.
   * @param component The component to be rendered inside the dialog
   * @param header The title of the modal
   * @returns Observable with the selected entity
   */
  public open<T>(component: Type<any>, header: string): Observable<T> {
    const ref: DynamicDialogRef = this.dialogService.open(component, {
      header: header,
      // We use a responsive width. The max-width can be handled via CSS in styleClass if needed.
      width: '70%', 
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      dismissableMask: true,
      closable: true,
      styleClass: 'sysclinica-search-dialog'
    });

    return ref.onClose;
  }
}