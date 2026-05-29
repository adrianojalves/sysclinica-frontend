import { Injectable, signal } from '@angular/core';
import { MessageData, MessageType, ToastData, ToastType } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  
  currentMessage = signal<MessageData | null>(null);
  toasts = signal<ToastData[]>([]);

  /* Triggers a standard message (info, success, warning, error) */
  show(type: MessageType, title: string, text: string): void {
    if (type === 'question') return; // Questions must use the specific method below
    this.currentMessage.set({ type, title, text });
  }

  /* * Triggers a question message and returns a Promise.
   * The Promise resolves to 'true' (Sim) or 'false' (Não).
   */
  question(title: string, text: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.currentMessage.set({ type: 'question', title, text, resolve });
    });
  }

  /* Shows a self-dismissing toast notification */
  toast(type: ToastType, text: string, duration = 3000): void {
    const id = Date.now();
    this.toasts.update(list => [...list, { id, type, text }]);
    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== id));
    }, duration);
  }

  /* Closes the modal and resolves the Promise if it's a question */
  close(result: boolean = false): void {
    const msg = this.currentMessage();
    if (msg?.resolve) {
      msg.resolve(result); // Sends the user's choice back to the caller
    }
    this.currentMessage.set(null); // Clears the screen
  }
}