import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
  {
    path: 'auth',
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

