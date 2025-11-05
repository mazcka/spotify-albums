import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  constructor(private sanitizer: DomSanitizer) { }

  sanitizeInput(value: string): SafeHtml {
    if (!value) return '';
    return this.sanitizer.sanitize(1, value) || '';
  }
}
