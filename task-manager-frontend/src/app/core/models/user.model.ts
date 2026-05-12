export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  /** Format: dd/MM/yyyy HH:mm:ss */
  createdAt: string;
}

/** Minimal user for assignee pickers (API: GET /api/users/picker). */
export interface UserPicker {
  id: number;
  name: string;
}
