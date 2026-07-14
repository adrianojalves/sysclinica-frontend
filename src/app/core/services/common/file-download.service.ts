import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FileDownloadService {
  private readonly http = inject(HttpClient);

  /**
   * Downloads a physical file from a Blob in the browser.
   * 
   * @param blob The binary content of the file.
   * @param filename The name of the file to save.
   */
  public downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Performs an HTTP GET request to download a file and trigger its save dialog.
   * 
   * @param url The endpoint URL.
   * @param filename The default filename to use.
   * @param params Optional HTTP request parameters.
   */
  public downloadFromUrl(
    url: string, 
    filename: string, 
    params?: HttpParams | { [param: string]: any }
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(url, {
      params,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      tap((response: HttpResponse<Blob>) => {
        const blob = response.body;
        if (blob) {
          // If the server provides a filename in the content-disposition header, use it
          let finalFilename = filename;
          const disposition = response.headers.get('content-disposition');
          if (disposition) {
            const match = disposition.match(/filename=([^;]+)/i);
            if (match) {
              finalFilename = match[1].trim().replace(/['"]/g, '');
            }
          }
          this.downloadBlob(blob, finalFilename);
        }
      })
    );
  }
}
