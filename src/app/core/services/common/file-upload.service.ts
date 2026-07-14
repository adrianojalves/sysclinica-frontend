import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private readonly http = inject(HttpClient);

  /**
   * Performs an HTTP POST request to upload a file with multipart/form-data.
   * 
   * @param url The endpoint URL.
   * @param file The file object to upload.
   * @param fieldName The form data field name for the file. Default is 'file'.
   * @param additionalData Optional extra parameters to send along with the file.
   */
  public upload<T = any>(
    url: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, string | Blob | any>
  ): Observable<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        const val = additionalData[key];
        if (val !== undefined && val !== null) {
          formData.append(key, val);
        }
      });
    }

    return this.http.post<T>(url, formData);
  }
}
