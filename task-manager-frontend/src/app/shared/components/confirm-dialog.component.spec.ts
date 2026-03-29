import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  const mockData: ConfirmDialogData = {
    title: 'Confirm',
    message: 'Are you sure?',
    confirmLabel: 'Yes',
    isDanger: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive dialog data', () => {
    expect(component.data.title).toBe('Confirm');
    expect(component.data.message).toBe('Are you sure?');
    expect(component.data.confirmLabel).toBe('Yes');
    expect(component.data.isDanger).toBe(true);
  });

  it('should render title and message', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Confirm');
    expect(el.textContent).toContain('Are you sure?');
  });
});

