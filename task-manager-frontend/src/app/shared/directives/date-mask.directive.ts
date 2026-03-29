    import { Directive, ElementRef, HostListener } from '@angular/core';

/**
 * Directive: dateMask
 *
 * Applied to <input [matDatepicker]="..."> fields.
 * Allows the user to type only digits and auto-formats them as dd/MM/yyyy.
 *
 * Examples:
 *   "0"           → "0"
 *   "01"          → "01"
 *   "010"         → "01/0"
 *   "0108"        → "01/08"
 *   "01082"       → "01/08/2"
 *   "01082026"    → "01/08/2026"
 */
@Directive({
  selector: 'input[dateMask]',
  standalone: true,
})
export class DateMaskDirective {

  private _busy = false;

  constructor(private readonly el: ElementRef<HTMLInputElement>) {}

  // ── Block non-digit keys (allow control keys) ──────────────────────
  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    const ctrl = e.ctrlKey || e.metaKey;
    const nav  = ['Backspace','Delete','Tab','Escape','Enter',
                  'Home','End','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key);
    if (nav || ctrl) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  }

  // ── Format on every input event ────────────────────────────────────
  @HostListener('input')
  onInput(): void {
    if (this._busy) return;

    const input   = this.el.nativeElement;
    const digits  = input.value.replace(/\D/g, '').substring(0, 8);
    const masked  = this._applyMask(digits);

    if (masked === input.value) return;

    // Calculate where to put the cursor after reformatting
    const before   = input.selectionStart ?? masked.length;
    const digBefore = input.value.substring(0, before).replace(/\D/g, '').length;
    const cursorPos = this._digitsToCursorPos(digBefore, masked);

    this._busy = true;
    input.value = masked;
    input.setSelectionRange(cursorPos, cursorPos);
    // Let Angular Material's value accessor pick up the new value
    input.dispatchEvent(new Event('input', { bubbles: true }));
    this._busy = false;
  }

  // ── Paste: strip slashes before processing ─────────────────────────
  @HostListener('paste', ['$event'])
  onPaste(e: ClipboardEvent): void {
    e.preventDefault();
    const raw    = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '').substring(0, 8);
    const masked = this._applyMask(raw);
    const input  = this.el.nativeElement;

    this._busy = true;
    input.value = masked;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    this._busy = false;
  }

  // ── Helpers ────────────────────────────────────────────────────────

  private _applyMask(digits: string): string {
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  /** Map how many digits the cursor has passed to the actual char position in the masked string */
  private _digitsToCursorPos(digitCount: number, masked: string): number {
    let d = 0;
    for (let i = 0; i < masked.length; i++) {
      if (/\d/.test(masked[i])) d++;
      if (d === digitCount) return i + 1;
    }
    return masked.length;
  }
}

