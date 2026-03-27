import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskFilter, TaskRequest } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private readonly API = '/api/tasks';

  constructor(private readonly http: HttpClient) {}

  getAll(filter?: TaskFilter): Observable<Task[]> {
    let params = new HttpParams();

    if (filter) {
      if (filter.title)                params = params.set('title',        filter.title);
      if (filter.description)          params = params.set('description',  filter.description);
      if (filter.assigneeId   != null) params = params.set('assigneeId',   filter.assigneeId);
      if (filter.createdById  != null) params = params.set('createdById',  filter.createdById);
      if (filter.priority)             params = params.set('priority',     filter.priority);
      if (filter.status)               params = params.set('status',       filter.status);
      if (filter.dueDateUntil)         params = params.set('dueDateUntil', filter.dueDateUntil);
    }

    return this.http.get<Task[]>(this.API, { params });
  }

  getById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.API}/${id}`);
  }

  create(task: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.API, task);
  }

  update(id: number, task: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.API}/${id}`, task);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  complete(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.API}/${id}/complete`, {});
  }

  cancel(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.API}/${id}/cancel`, {});
  }
}
