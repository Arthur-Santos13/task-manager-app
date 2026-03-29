import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

import { TaskShellComponent } from './task-shell.component';
import { AuthService } from '../../../core/services/auth.service';

describe('TaskShellComponent', () => {
  let component: TaskShellComponent;
  let fixture: ComponentFixture<TaskShellComponent>;
  let authServiceMock: { logout: jest.Mock; currentUser: ReturnType<typeof signal> };
  let router: Router;

  beforeEach(async () => {
    authServiceMock = {
      logout: jest.fn(),
      currentUser: signal({ userId: 1, name: 'User', email: 'u@t.com', role: 'USER' as const }),
    };

    await TestBed.configureTestingModule({
      imports: [TaskShellComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    fixture = TestBed.createComponent(TaskShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('logout — should call authService.logout and navigate to /auth/login', () => {
    component.logout();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('user signal should reflect currentUser from AuthService', () => {
    expect(component.user()).toEqual(
      expect.objectContaining({ userId: 1, name: 'User' }),
    );
  });
});

