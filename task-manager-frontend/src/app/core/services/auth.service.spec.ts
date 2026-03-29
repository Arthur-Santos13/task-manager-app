import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockResponse: AuthResponse = {
    token: 'jwt-token-123',
    tokenType: 'Bearer',
    userId: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── login ───────────────────────────────────────────────────────────

  it('login — should POST to /api/auth/login and persist token', () => {
    const request = { email: 'test@example.com', password: 'secret' };

    service.login(request).subscribe(res => {
      expect(res.token).toBe('jwt-token-123');
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);

    expect(localStorage.getItem('auth_token')).toBe('jwt-token-123');
    expect(service.getToken()).toBe('jwt-token-123');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()?.email).toBe('test@example.com');
  });

  // ── register ────────────────────────────────────────────────────────

  it('register — should POST to /api/auth/register and persist token', () => {
    const request = { name: 'New', email: 'new@test.com', password: 'secret' };

    service.register(request).subscribe(res => {
      expect(res.userId).toBe(1);
    });

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(service.isLoggedIn()).toBe(true);
  });

  // ── logout ──────────────────────────────────────────────────────────

  it('logout — should clear localStorage and signals', () => {
    // First login to populate state
    service.login({ email: 'test@example.com', password: 'secret' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush(mockResponse);

    expect(service.isLoggedIn()).toBe(true);

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.getToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  // ── getToken ────────────────────────────────────────────────────────

  it('getToken — should return null when not logged in', () => {
    expect(service.getToken()).toBeNull();
  });
});

