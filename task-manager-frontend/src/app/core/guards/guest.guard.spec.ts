import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { guestGuard } from './guest.guard';
import { AuthService } from '../services/auth.service';

describe('guestGuard', () => {
  let authServiceMock: { isLoggedIn: jest.Mock };
  let routerMock: { createUrlTree: jest.Mock };

  beforeEach(() => {
    authServiceMock = { isLoggedIn: jest.fn() };
    routerMock = { createUrlTree: jest.fn().mockReturnValue('tasks-tree' as unknown as UrlTree) };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should return true when user is NOT logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as any, {} as any),
    );

    expect(result).toBe(true);
  });

  it('should redirect to /tasks when user IS logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as any, {} as any),
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/tasks']);
    expect(result).toBe('tasks-tree');
  });
});

