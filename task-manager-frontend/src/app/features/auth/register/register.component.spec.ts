import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models/auth.model';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: { register: jest.Mock };
  let router: Router;

  const mockResponse: AuthResponse = {
    token: 'jwt', tokenType: 'Bearer', userId: 1, name: 'New User', email: 'n@t.com', role: 'USER',
  };

  beforeEach(async () => {
    authServiceMock = { register: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('form should be valid with correct data', () => {
    component.form.setValue({ name: 'Test', email: 'test@test.com', password: 'secret123' });
    expect(component.form.valid).toBe(true);
  });

  it('name control should require minLength 2', () => {
    component.nameCtrl.setValue('A');
    expect(component.nameCtrl.hasError('minlength')).toBe(true);
  });

  it('onSubmit — should NOT call authService if form is invalid', () => {
    component.onSubmit();
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('onSubmit — success should navigate to /tasks', fakeAsync(() => {
    authServiceMock.register.mockReturnValue(of(mockResponse));
    component.form.setValue({ name: 'User', email: 'n@t.com', password: 'secret123' });

    component.onSubmit();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    expect(component.loading()).toBe(false);
  }));

  it('onSubmit — error should set errorMessage', fakeAsync(() => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { status: 400, message: 'E-mail already in use: n@t.com' },
    });
    authServiceMock.register.mockReturnValue(throwError(() => error));
    component.form.setValue({ name: 'User', email: 'n@t.com', password: 'secret123' });

    component.onSubmit();
    tick();

    expect(component.errorMessage()).toBe('E-mail already in use: n@t.com');
    expect(component.loading()).toBe(false);
  }));

  it('togglePassword — should toggle hidePassword signal', () => {
    expect(component.hidePassword()).toBe(true);
    component.togglePassword();
    expect(component.hidePassword()).toBe(false);
  });
});

