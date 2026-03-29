import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let authServiceMock: { getToken: jest.Mock };

  beforeEach(() => {
    authServiceMock = { getToken: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should add Authorization header when token exists', () => {
    authServiceMock.getToken.mockReturnValue('my-jwt-token');

    http.get('/api/tasks').subscribe();

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush([]);
  });

  it('should NOT add Authorization header when token is null', () => {
    authServiceMock.getToken.mockReturnValue(null);

    http.get('/api/tasks').subscribe();

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });
});

