import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskRequest } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private readonly API = '/api/tasks';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Task[]> {
    throw new Error('Not implemented yet');
  }

  getById(_id: number): Observable<Task> {
    throw new Error('Not implemented yet');
  }

  create(_task: TaskRequest): Observable<Task> {
    throw new Error('Not implemented yet');
  }

  update(_id: number, _task: TaskRequest): Observable<Task> {
    throw new Error('Not implemented yet');
  }

  delete(_id: number): Observable<void> {
    throw new Error('Not implemented yet');
  }
}

