import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tasks/task-shell/task-shell.component').then(m => m.TaskShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/tasks/task-list/task-list.component').then(m => m.TaskListComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/tasks/task-form/task-form.component').then(m => m.TaskFormComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./features/tasks/task-form/task-form.component').then(m => m.TaskFormComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'tasks',
  },
];
