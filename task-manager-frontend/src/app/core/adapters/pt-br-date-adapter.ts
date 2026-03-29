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
        return isNaN(date.getTime()) ? null : date;
      }

      // Partial – let parent try
    }

    return super.parse(value, parseFormat);
  }
}

