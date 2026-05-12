import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Description',
    assignee: { id: 2, name: 'Assignee', email: 'a@test.com', role: 'USER', createdAt: '' },
    priority: 'HIGH',
    dueDate: '31/12/2026',
    status: 'IN_PROGRESS',
    createdBy: { id: 1, name: 'Creator', email: 'c@test.com', role: 'USER', createdAt: '' },
    createdAt: '01/01/2026 00:00:00',
    updatedAt: '01/01/2026 00:00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── getPage ─────────────────────────────────────────────────────────

  it('getPage — without filter should GET /api/tasks with page params', () => {
    service.getPage(undefined, 0, 20).subscribe(page => {
      expect(page.content).toHaveLength(1);
      expect(page.totalElements).toBe(1);
      expect(page.content[0].title).toBe('Test Task');
    });

    const req = httpMock.expectOne(r =>
      r.url === '/api/tasks'
      && r.params.get('page') === '0'
      && r.params.get('size') === '20',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      content: [mockTask],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 20,
    });
  });

  it('getPage — with filter should set query params and hideFinished=false when status set', () => {
    service.getPage({ title: 'bug', priority: 'HIGH', status: 'TODO' }, 1, 10).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === '/api/tasks'
      && r.params.get('title') === 'bug'
      && r.params.get('priority') === 'HIGH'
      && r.params.get('status') === 'TODO'
      && r.params.get('hideFinished') === 'false'
      && r.params.get('page') === '1'
      && r.params.get('size') === '10',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ content: [], totalElements: 0, totalPages: 0, number: 1, size: 10 });
  });

  // ── getById ─────────────────────────────────────────────────────────

  it('getById — should GET /api/tasks/:id', () => {
    service.getById(1).subscribe(task => {
      expect(task.id).toBe(1);
    });

    const req = httpMock.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockTask);
  });

  // ── create ──────────────────────────────────────────────────────────

  it('create — should POST /api/tasks', () => {
    const body = {
      title: 'New', description: '', assigneeId: 2,
      priority: 'HIGH' as const, dueDate: '31/12/2026', status: 'TODO' as const,
    };
    service.create(body).subscribe(task => {
      expect(task.title).toBe('Test Task');
    });

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockTask);
  });

  // ── update ──────────────────────────────────────────────────────────

  it('update — should PUT /api/tasks/:id', () => {
    const body = {
      title: 'Updated', description: '', assigneeId: 2,
      priority: 'MEDIUM' as const, dueDate: '31/12/2026', status: 'IN_PROGRESS' as const,
    };
    service.update(1, body).subscribe();

    const req = httpMock.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('PUT');
    req.flush(mockTask);
  });

  // ── delete ──────────────────────────────────────────────────────────

  it('delete — should DELETE /api/tasks/:id', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ── complete ────────────────────────────────────────────────────────

  it('complete — should PATCH /api/tasks/:id/complete', () => {
    service.complete(1).subscribe();

    const req = httpMock.expectOne('/api/tasks/1/complete');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockTask, status: 'COMPLETED' });
  });

  // ── start ───────────────────────────────────────────────────────────

  it('start — should PATCH /api/tasks/:id/start', () => {
    service.start(1).subscribe();

    const req = httpMock.expectOne('/api/tasks/1/start');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockTask, status: 'IN_PROGRESS' });
  });

  // ── cancel ──────────────────────────────────────────────────────────

  it('cancel — should PATCH /api/tasks/:id/cancel', () => {
    service.cancel(1).subscribe();

    const req = httpMock.expectOne('/api/tasks/1/cancel');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockTask, status: 'CANCELLED' });
  });
});

