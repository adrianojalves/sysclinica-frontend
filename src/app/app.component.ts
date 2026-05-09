import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageModalComponent } from './shared/components/message-modal/message-modal.component';
import { GlobalLoaderComponent } from './shared/components/global-loader/global-loader.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MessageModalComponent, GlobalLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'SysClinica';
}
