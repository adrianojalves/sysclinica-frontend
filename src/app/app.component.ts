import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageModalComponent } from './shared/components/message-modal/message-modal.component';
import { GlobalLoaderComponent } from './shared/components/global-loader/global-loader.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MessageModalComponent, GlobalLoaderComponent, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'SysClinica';
}
