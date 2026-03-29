import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models/auth.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: { login: jest.Mock };
  let router: Router;

  const mockResponse: AuthResponse = {
    token: 'jwt', tokenType: 'Bearer', userId: 1, name: 'User', email: 'u@t.com', role: 'USER',
  };

  beforeEach(async () => {
    authServiceMock = { login: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    fixture = TestBed.createComponent(LoginComponent);
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
    component.form.setValue({ email: 'user@test.com', password: 'secret123' });
    expect(component.form.valid).toBe(true);
  });

  it('email control should be invalid with bad email', () => {
    component.emailCtrl.setValue('not-an-email');
    expect(component.emailCtrl.hasError('email')).toBe(true);
  });

  it('password control should require minLength 6', () => {
    component.passwordCtrl.setValue('12345');
    expect(component.passwordCtrl.hasError('minlength')).toBe(true);
  });

  it('onSubmit — should NOT call authService if form is invalid', () => {
    component.onSubmit();
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('onSubmit — success should navigate to /tasks', fakeAsync(() => {
    authServiceMock.login.mockReturnValue(of(mockResponse));
    component.form.setValue({ email: 'u@t.com', password: 'secret123' });

    component.onSubmit();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    expect(component.loading()).toBe(false);
  }));

  it('onSubmit — error should set errorMessage', fakeAsync(() => {
    const error = new HttpErrorResponse({
      status: 401,
      error: { status: 401, message: 'Invalid email or password.' },
    });
    authServiceMock.login.mockReturnValue(throwError(() => error));
    component.form.setValue({ email: 'u@t.com', password: 'wrong1' });

    component.onSubmit();
    tick();

    expect(component.errorMessage()).toBe('Invalid email or password.');
    expect(component.loading()).toBe(false);
  }));

  it('togglePassword — should toggle hidePassword signal', () => {
    expect(component.hidePassword()).toBe(true);
    component.togglePassword();
    expect(component.hidePassword()).toBe(false);
    component.togglePassword();
    expect(component.hidePassword()).toBe(true);
  });
});

