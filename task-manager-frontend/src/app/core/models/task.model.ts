import { User } from './user.model';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Task {
  id: number;
  title: string;
  description: string;
  assignee: User;
  priority: TaskPriority;
  /** Format: dd/MM/yyyy */
  dueDate: string | null;
  status: TaskStatus;
  createdBy: User;
  /** Format: dd/MM/yyyy HH:mm:ss */
  createdAt: string;
  /** Format: dd/MM/yyyy HH:mm:ss */
  updatedAt: string;
}

export interface TaskRequest {
  title: string;
  description: string;
  assigneeId: number;
  priority: TaskPriority;
  /** Format: dd/MM/yyyy */
  dueDate: string | null;
  status: TaskStatus;
}

export interface TaskFilter {
  title?: string;
  description?: string;
  assigneeId?: number;
  createdById?: number;
  priority?: TaskPriority;
  status?: TaskStatus;
  /** Format: dd/MM/yyyy */
  dueDateUntil?: string;
}
