import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReceiptTextService } from '../../../core/services/receipt-text/receipt-text.service';
import { MessageService } from '../../../core/services/message.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ReceiptText } from '../../../core/models/receipt-text/receipt-text.model';
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';

@Component({
  selector: 'app-receipt-text-form',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './receipt-text-form.component.html'
})
export class ReceiptTextFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly receiptTextService = inject(ReceiptTextService);
  private readonly messageService = inject(MessageService);
  private readonly loadingService = inject(LoadingService);

  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  public receiptForm!: FormGroup;
  public receiptText = signal<ReceiptText | null>(null);
  public tags = signal<string[]>([]);

  ngOnInit(): void {
    this.initForm();
    this.loadReceiptText();
    this.loadTags();
  }

  private initForm(): void {
    this.receiptForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  /**
   * Loads the singleton receipt text from backend
   */
  private loadReceiptText(): void {
    this.loadingService.show();
    this.receiptTextService.getReceiptText().subscribe({
      next: (data: ReceiptText) => {
        if (data) {
          this.receiptText.set(data);
          this.receiptForm.patchValue({
            text: data.text
          });
        }
        this.loadingService.hide();
      },
      error: () => this.loadingService.hide()
    });
  }

  /**
   * Loads available replacement tags from backend
   */
  private loadTags(): void {
    this.receiptTextService.getTags().subscribe({
      next: (tagsList: string[]) => {
        this.tags.set(tagsList);
      },
      error: () => {
        this.messageService.show('error', 'Erro', 'Falha ao carregar as tags do recibo.');
      }
    });
  }

  /**
   * Copies the selected tag to clipboard formatted with braces and displays a notification
   */
  public copyTag(tag: string): void {
    const formattedTag = `{${tag}}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(formattedTag).then(() => {
        this.messageService.show('info', 'Tag Copiada', `A tag "${formattedTag}" foi copiada para a área de transferência.`);
      }).catch(() => {
        this.fallbackCopy(formattedTag);
      });
    } else {
      this.fallbackCopy(formattedTag);
    }
  }

  private fallbackCopy(tag: string): void {
    const input = document.createElement('input');
    input.value = tag;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      this.messageService.show('info', 'Tag Copiada', `A tag "${tag}" foi copiada para a área de transferência.`);
    } catch (err) {
      this.messageService.show('warning', 'Aviso', `Não foi possível copiar automaticamente. Digite no texto: ${tag}`);
    }
    document.body.removeChild(input);
  }

  /**
   * Inserts the tag directly into the textarea at the cursor position formatted as {tag_name}
   */
  public insertTagAtCursor(tag: string): void {
    const textareaEl = this.textarea.nativeElement;
    const start = textareaEl.selectionStart;
    const end = textareaEl.selectionEnd;
    const currentText = this.receiptForm.get('text')?.value || '';

    // Insert the tag formatted as {tag}
    const formattedTag = `{${tag}}`;
    const newText = currentText.substring(0, start) + formattedTag + currentText.substring(end);
    this.receiptForm.patchValue({ text: newText });

    // Move cursor focus back to textarea and place it after the inserted tag
    setTimeout(() => {
      textareaEl.focus();
      const newCursorPos = start + formattedTag.length;
      textareaEl.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  }

  /**
   * Saves the receipt text settings
   */
  public onSubmit(): void {
    if (this.receiptForm.invalid) {
      this.receiptForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();
    const textValue = this.receiptForm.get('text')?.value;

    this.receiptTextService.updateReceiptText(textValue).subscribe({
      next: (saved: ReceiptText) => {
        this.receiptText.set(saved);
        this.messageService.show('success', 'Sucesso', 'Texto do recibo atualizado com sucesso!');
        this.loadingService.hide();
      },
      error: (err: any) => {
        this.loadingService.hide();
        const msg = err.error?.message || 'Erro ao salvar o texto do recibo.';
        this.messageService.show('error', 'Erro', msg);
      }
    });
  }
}
