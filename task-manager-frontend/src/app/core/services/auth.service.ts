import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY  = 'auth_user';
  private readonly API       = '/api/auth';

  private readonly _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private readonly _user  = signal<AuthUser | null>(this._loadUser());

  readonly isLoggedIn  = computed(() => !!this._token());
  readonly currentUser = this._user.asReadonly();

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API}/login`, request)
      .pipe(tap(res => this._persist(res)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API}/register`, request)
      .pipe(tap(res => this._persist(res)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  getToken(): string | null {
    return this._token();
  }

  // ---------------------------------------------------------------------------

  private _persist(response: AuthResponse): void {
    const user: AuthUser = {
      userId: response.userId,
      name:   response.name,
      email:  response.email,
      role:   response.role,
    };
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._token.set(response.token);
    this._user.set(user);
  }

  private _loadUser(): AuthUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }
}
