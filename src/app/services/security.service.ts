import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly sanitizer = inject(DomSanitizer);

  readonly sanitizeInput = (value: string): SafeHtml => {
    if (!value) return '';
    return this.sanitizer.sanitize(1, value) || '';
  }
}
