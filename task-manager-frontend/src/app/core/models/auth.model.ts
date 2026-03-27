export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

/** Subset of the authenticated user kept in memory / localStorage. */
export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}
