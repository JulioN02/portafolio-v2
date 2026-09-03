/**
 * Extract the visible text from an HTML string (e.g. rich-text editor output).
 *
 * Works in both the browser (DOM-based) and Node.js (regex fallback) so the
 * shared Zod schemas can measure the *visible* length of rich-text fields
 * (shortDescription, body, ...) consistently with the admin forms.
 */
export function getTextFromHTML(html: string): string {
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  // Server-side fallback: strip tags and decode the common entities.
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}