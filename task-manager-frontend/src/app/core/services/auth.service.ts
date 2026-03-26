import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API = '/api/auth';

  readonly isLoggedIn = signal(false);

  constructor(private readonly http: HttpClient) {}

  login(_request: LoginRequest): Observable<AuthResponse> {
    throw new Error('Not implemented yet');
  }

  register(_request: RegisterRequest): Observable<AuthResponse> {
    throw new Error('Not implemented yet');
  }

  logout(): void {
    throw new Error('Not implemented yet');
  }

  getToken(): string | null {
    throw new Error('Not implemented yet');
  }
}

