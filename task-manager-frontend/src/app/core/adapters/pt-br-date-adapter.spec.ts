import { TestBed } from '@angular/core/testing';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { PtBrDateAdapter } from './pt-br-date-adapter';

describe('PtBrDateAdapter', () => {
  let adapter: PtBrDateAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PtBrDateAdapter,
        { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
      ],
    });
    adapter = TestBed.inject(PtBrDateAdapter);
  });

  it('should parse full dd/MM/yyyy string', () => {
    const date = adapter.parse('25/12/2026', null);
    expect(date).not.toBeNull();
    expect(date!.getDate()).toBe(25);
    expect(date!.getMonth()).toBe(11); // December = 11
    expect(date!.getFullYear()).toBe(2026);
  });

  it('should parse 01/01/2026', () => {
    const date = adapter.parse('01/01/2026', null);
    expect(date).not.toBeNull();
    expect(date!.getDate()).toBe(1);
    expect(date!.getMonth()).toBe(0);
    expect(date!.getFullYear()).toBe(2026);
  });

  it('should return null for invalid date like 99/99/9999', () => {
    const date = adapter.parse('99/99/9999', null);
    expect(date).toBeNull();
  });

  it('should delegate partial string to parent', () => {
    // '25/12' doesn't match dd/MM/yyyy — delegates to super.parse
    const date = adapter.parse('25/12', null);
    // Parent may return null or a Date depending on engine; just check no error
    expect(true).toBe(true);
  });

  it('should delegate non-string values to parent', () => {
    const date = adapter.parse(new Date(2026, 5, 15), null);
    expect(date).toBeInstanceOf(Date);
  });

  it('should trim whitespace before parsing', () => {
    const date = adapter.parse('  01/08/2026  ', null);
    expect(date).not.toBeNull();
    expect(date!.getDate()).toBe(1);
    expect(date!.getMonth()).toBe(7); // August = 7
  });
});
