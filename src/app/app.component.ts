import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageModalComponent } from './shared/components/message-modal/message-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MessageModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'SysClinica';
}
