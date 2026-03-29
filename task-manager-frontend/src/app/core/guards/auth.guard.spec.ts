import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceMock: { isLoggedIn: jest.Mock };
  let routerMock: { createUrlTree: jest.Mock };

  beforeEach(() => {
    authServiceMock = { isLoggedIn: jest.fn() };
    routerMock = { createUrlTree: jest.fn().mockReturnValue('login-tree' as unknown as UrlTree) };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should return true when user is logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any),
    );

    expect(result).toBe(true);
  });

  it('should redirect to /auth/login when user is not logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any),
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toBe('login-tree');
  });
});

