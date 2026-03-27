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

/** Shape of the backend ErrorResponse DTO. */
export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  fieldErrors: Record<string, string> | null;
}

