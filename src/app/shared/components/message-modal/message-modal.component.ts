import { Component, inject } from '@angular/core';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-message-modal',
  imports: [],
  templateUrl: './message-modal.component.html'
})
export class MessageModalComponent {
  // Inject the service so the HTML can read the Signal and call the close method
  public messageService = inject(MessageService);
}