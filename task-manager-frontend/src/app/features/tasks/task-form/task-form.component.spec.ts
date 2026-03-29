import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TaskFormComponent } from './task-form.component';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let taskServiceMock: Record<string, jest.Mock>;
  let router: Router;
  let snackBarMock: { open: jest.Mock };

  const mockUser: User = { id: 1, name: 'User', email: 'u@t.com', role: 'USER', createdAt: '' };

  function setupTestBed(routeId: string | null = null) {
    taskServiceMock = {
      create: jest.fn().mockReturnValue(of({ id: 1 } as Task)),
      update: jest.fn().mockReturnValue(of({ id: 1 } as Task)),
      getById: jest.fn().mockReturnValue(of({
        id: 1, title: 'Edit Task', description: 'desc',
        assignee: mockUser, priority: 'HIGH', dueDate: '31/12/2026',
        status: 'IN_PROGRESS', createdBy: mockUser, createdAt: '', updatedAt: '',
      } as Task)),
    };
    snackBarMock = { open: jest.fn() };

    return TestBed.configureTestingModule({
      imports: [TaskFormComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: TaskService, useValue: taskServiceMock },
        { provide: UserService, useValue: { getAll: jest.fn().mockReturnValue(of([mockUser])) } },
        {
          provide: AuthService,
          useValue: { currentUser: signal({ userId: 1, name: 'User', email: 'u@t.com', role: 'USER' }) },
        },
        { provide: MatSnackBar, useValue: snackBarMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => routeId } } },
        },
      ],
    })
    .overrideComponent(TaskFormComponent, {
      remove: { imports: [MatSnackBarModule] },
    })
    .compileComponents();
  }

  // ── Create mode ─────────────────────────────────────────────────────

  describe('create mode', () => {
    beforeEach(async () => {
      await setupTestBed(null);
      router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
      fixture = TestBed.createComponent(TaskFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create in create mode', () => {
      expect(component).toBeTruthy();
      expect(component.isEditMode).toBe(false);
    });

    it('form should be invalid when empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('onSubmit — should NOT call service if form invalid', () => {
      component.onSubmit();
      expect(taskServiceMock.create).not.toHaveBeenCalled();
    });

    it('onSubmit — valid form should call create and navigate', fakeAsync(() => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      component.form.setValue({
        title: 'New Task',
        description: 'desc',
        assigneeId: 1,
        priority: 'HIGH',
        status: 'TODO',
        dueDate: futureDate,
      });

      component.onSubmit();
      tick();

      expect(taskServiceMock.create).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
      expect(snackBarMock.open).toHaveBeenCalled();
    }));

    it('_futureDateValidator — should reject past dates in create mode', () => {
      const pastDate = new Date(2020, 0, 1);
      component.form.controls.dueDate.setValue(pastDate);
      expect(component.form.controls.dueDate.hasError('pastDate')).toBe(true);
    });

    it('_futureDateValidator — should accept future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      component.form.controls.dueDate.setValue(futureDate);
      expect(component.form.controls.dueDate.hasError('pastDate')).toBe(false);
    });
  });

  // ── Edit mode ───────────────────────────────────────────────────────

  describe('edit mode', () => {
    beforeEach(async () => {
      await setupTestBed('1');
      router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
      fixture = TestBed.createComponent(TaskFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set isEditMode and load task', fakeAsync(() => {
      tick();
      expect(component.isEditMode).toBe(true);
      expect(component.taskId).toBe(1);
      expect(taskServiceMock.getById).toHaveBeenCalledWith(1);
      expect(component.form.controls.title.value).toBe('Edit Task');
    }));

    it('onSubmit — valid form should call update', fakeAsync(() => {
      tick(); // wait for loadTask

      component.onSubmit();
      tick();

      expect(taskServiceMock.update).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    }));
  });
});

