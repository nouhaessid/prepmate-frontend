import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ breaks: true, gfm: true });

@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined, mode: 'block' | 'inline' = 'block'): SafeHtml {
    if (!value) return '';
    const rawHtml =
      mode === 'inline' ? (marked.parseInline(value) as string) : (marked.parse(value) as string);
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }
}