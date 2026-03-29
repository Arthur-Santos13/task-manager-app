import { inject, Injectable, Optional } from '@angular/core';
import { MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';

/**
 * Extends NativeDateAdapter to parse the dd/MM/yyyy string format used by
 * the PT-BR locale.  The built-in NativeDateAdapter.parse() delegates to
 * `new Date(value)` which is US-biased (MM/dd/yyyy).
 */
@Injectable()
export class PtBrDateAdapter extends NativeDateAdapter {

  override parse(value: unknown, parseFormat: unknown): Date | null {
    if (typeof value === 'string') {
      const v = value.trim();

      // Full dd/MM/yyyy
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
        const [d, m, y] = v.split('/').map(Number);
        const date = new Date(y, m - 1, d);
        // Validate: Date constructor normalizes overflows, so verify the parts match
        if (isNaN(date.getTime()) || date.getDate() !== d || date.getMonth() !== m - 1 || date.getFullYear() !== y) {
          return null;
        }
        return date;
      }

      // Partial – let parent try
    }

    return super.parse(value, parseFormat);
  }
}

