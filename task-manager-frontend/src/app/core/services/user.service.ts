import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserPicker } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly API = '/api/users';

  constructor(private readonly http: HttpClient) {}

  /** Id + name only; available to any authenticated user (assignee picker). */
  getPicker(): Observable<UserPicker[]> {
    return this.http.get<UserPicker[]>(`${this.API}/picker`);
  }

  /** Full user list; ADMIN only. */
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.API);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API}/${id}`);
  }
}

