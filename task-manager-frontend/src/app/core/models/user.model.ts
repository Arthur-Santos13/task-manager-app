export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  /** Format: dd/MM/yyyy HH:mm:ss */
  createdAt: string;
}
