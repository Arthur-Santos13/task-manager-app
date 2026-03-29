import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TaskListComponent } from './task-list.component';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskServiceMock: Record<string, jest.Mock>;
  let userServiceMock: { getAll: jest.Mock };
  let dialogMock: { open: jest.Mock };
  let snackBarMock: { open: jest.Mock };

  const mockUser: User = { id: 1, name: 'User', email: 'u@t.com', role: 'USER', createdAt: '' };
  const mockTask: Task = {
    id: 1, title: 'Task 1', description: '', assignee: mockUser,
    priority: 'HIGH', dueDate: '31/12/2026', status: 'IN_PROGRESS',
    createdBy: mockUser, createdAt: '', updatedAt: '',
  };

  beforeEach(async () => {
    taskServiceMock = {
      getAll: jest.fn().mockReturnValue(of([mockTask])),
      start: jest.fn().mockReturnValue(of(mockTask)),
      complete: jest.fn().mockReturnValue(of(mockTask)),
      cancel: jest.fn().mockReturnValue(of(mockTask)),
      delete: jest.fn().mockReturnValue(of(undefined)),
    };
    userServiceMock = { getAll: jest.fn().mockReturnValue(of([mockUser])) };
    dialogMock = { open: jest.fn() };
    snackBarMock = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [TaskListComponent, NoopAnimationsModule],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: UserService, useValue: userServiceMock },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal({ userId: 1, name: 'User', email: 'u@t.com', role: 'USER' }),
          },
        },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        provideRouter([]),
      ],
    })
    .overrideComponent(TaskListComponent, {
      remove: { imports: [MatSnackBarModule, MatDialogModule] },
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('ngOnInit — should load users and tasks', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(userServiceMock.getAll).toHaveBeenCalled();
    expect(taskServiceMock.getAll).toHaveBeenCalled();
    expect(component.dataSource.data).toHaveLength(1);
  }));

  it('clearFilter — should reset form and reload tasks', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    component.filterForm.patchValue({ title: 'bug' });

    component.clearFilter();
    tick();

    expect(component.filterForm.value.title).toBeFalsy();
    expect(taskServiceMock.getAll).toHaveBeenCalledTimes(2); // init + clearFilter
  }));

  // ── Helper methods ──────────────────────────────────────────────────

  it('statusLabel — should return Portuguese labels', () => {
    expect(component.statusLabel('TODO')).toBe('A fazer');
    expect(component.statusLabel('IN_PROGRESS')).toBe('Em andamento');
    expect(component.statusLabel('COMPLETED')).toBe('Concluída');
    expect(component.statusLabel('CANCELLED')).toBe('Cancelada');
  });

  it('priorityLabel — should return Portuguese labels', () => {
    expect(component.priorityLabel('HIGH')).toBe('Alta');
    expect(component.priorityLabel('MEDIUM')).toBe('Média');
    expect(component.priorityLabel('LOW')).toBe('Baixa');
  });

  it('canComplete — true for TODO and IN_PROGRESS', () => {
    expect(component.canComplete({ ...mockTask, status: 'TODO' })).toBe(true);
    expect(component.canComplete({ ...mockTask, status: 'IN_PROGRESS' })).toBe(true);
    expect(component.canComplete({ ...mockTask, status: 'COMPLETED' })).toBe(false);
    expect(component.canComplete({ ...mockTask, status: 'CANCELLED' })).toBe(false);
  });

  it('canCancelTask — true for TODO and IN_PROGRESS', () => {
    expect(component.canCancelTask({ ...mockTask, status: 'TODO' })).toBe(true);
    expect(component.canCancelTask({ ...mockTask, status: 'COMPLETED' })).toBe(false);
  });

  it('canStart — true only when TODO and user is assignee', () => {
    expect(component.canStart({ ...mockTask, status: 'TODO' })).toBe(true);
    expect(component.canStart({ ...mockTask, status: 'IN_PROGRESS' })).toBe(false);

    const otherAssignee = { ...mockTask, status: 'TODO' as const, assignee: { ...mockUser, id: 99 } };
    expect(component.canStart(otherAssignee)).toBe(false);
  });

  it('onStartTask — should call taskService.start', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    component.onStartTask(mockTask);
    tick();

    expect(taskServiceMock.start).toHaveBeenCalledWith(1);
    expect(snackBarMock.open).toHaveBeenCalled();
  }));
});

