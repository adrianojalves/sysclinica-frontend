import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PdfDownloadService {

  open(response: HttpResponse<Blob>): void {
    const blob = response.body;
    if (!blob) return;

    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  }
}
