import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PdfDownloadService {

  /**
   * Opens the PDF blob response in a new tab.
   * To prevent the PDF viewer from downloading the file with a generic UUID name,
   * we wrap the Blob into a File object containing the filename parsed from the
   * Content-Disposition header. We also defer revoking the object URL to allow
   * the user enough time to download/save the PDF from the browser's viewer.
   */
  open(response: HttpResponse<Blob>): void {
    const blob = response.body;
    if (!blob) return;

    const filename = this.extractFilename(response);
    
    // Wrapping the Blob in a File object exposes the filename to the browser's PDF viewer download action
    const file = new File([blob], filename, { type: 'application/pdf' });
    const url = window.URL.createObjectURL(file);
    
    window.open(url, '_blank');
    
    // Defer revocation of the object URL (e.g., 5 minutes) to ensure the user has
    // enough time to view and subsequently trigger the download button in the PDF viewer
    setTimeout(() => window.URL.revokeObjectURL(url), 300000);
  }

  /**
   * Helper method to extract the filename from the Content-Disposition header
   */
  private extractFilename(response: HttpResponse<Blob>): string {
    const disposition = response.headers.get('content-disposition');
    if (disposition) {
      // 1. Try matching filename*=utf-8''encoded_name.pdf
      const utf8Match = disposition.match(/filename\*=utf-8''([^;]+)/i);
      if (utf8Match && utf8Match[1]) {
        try {
          return decodeURIComponent(utf8Match[1].trim());
        } catch {
          // Fallback to standard matching if decoding fails
        }
      }

      // 2. Try matching standard filename="name.pdf"
      const standardMatch = disposition.match(/filename=["']?([^;''"]+)["']?/i);
      if (standardMatch && standardMatch[1]) {
        try {
          return decodeURIComponent(standardMatch[1].trim());
        } catch {
          return standardMatch[1].trim();
        }
      }
    }

    // 3. Fallback to extracting from the URL path if available
    const url = response.url;
    if (url) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1].split('?')[0];
      if (lastPart && lastPart.length > 0) {
        return `${lastPart}.pdf`;
      }
    }

    return 'relatorio.pdf';
  }
}
