import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateMaskDirective } from './date-mask.directive';

@Component({
  standalone: true,
  imports: [DateMaskDirective],
  template: `<input dateMask />`,
})
class TestHostComponent {}

describe('DateMaskDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  function typeDigits(digits: string): void {
    input.value = digits;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  it('should allow digits up to 2 chars without slash', () => {
    typeDigits('01');
    expect(input.value).toBe('01');
  });

  it('should add slash after day (3 digits)', () => {
    typeDigits('010');
    expect(input.value).toBe('01/0');
  });

  it('should format 4 digits as dd/MM', () => {
    typeDigits('0108');
    expect(input.value).toBe('01/08');
  });

  it('should add second slash after month (5 digits)', () => {
    typeDigits('01082');
    expect(input.value).toBe('01/08/2');
  });

  it('should format 8 digits as dd/MM/yyyy', () => {
    typeDigits('01082026');
    expect(input.value).toBe('01/08/2026');
  });

  it('should block non-digit keydown', () => {
    const event = new KeyboardEvent('keydown', { key: 'a', cancelable: true });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should allow Backspace keydown', () => {
    const event = new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('should allow digit keydown', () => {
    const event = new KeyboardEvent('keydown', { key: '5', cancelable: true });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('should truncate input to max 8 digits (10 chars with slashes)', () => {
    typeDigits('010820261');  // 9 digits — should trim to 8
    expect(input.value).toBe('01/08/2026');
  });
});

