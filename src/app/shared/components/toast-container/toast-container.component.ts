import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MessageService } from '../../../core/services/message.service';
import { ToastData } from '../../../core/models/message.model';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast-container.component.html'
})
export class ToastContainerComponent {
  public readonly messageService = inject(MessageService);

  public dismiss(id: number): void {
    this.messageService.toasts.update(list => list.filter(t => t.id !== id));
  }

  public iconClass(toast: ToastData): string {
    const map: Record<string, string> = {
      success: 'pi pi-check-circle',
      warning: 'pi pi-exclamation-triangle',
      error:   'pi pi-times-circle',
      info:    'pi pi-info-circle'
    };
    return map[toast.type] ?? 'pi pi-info-circle';
  }

  public colorClasses(toast: ToastData): string {
    const map: Record<string, string> = {
      success: 'bg-verde-teal text-branco-puro',
      warning: 'bg-yellow-500 text-branco-puro',
      error:   'bg-vermelho-alerta text-branco-puro',
      info:    'bg-azul-prisma text-branco-puro'
    };
    return map[toast.type] ?? 'bg-cinza-chumbo text-branco-puro';
  }
}
