import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { User } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUsers: User[] = [
    { id: 1, name: 'Alice', email: 'alice@test.com', role: 'USER', createdAt: '' },
    { id: 2, name: 'Bob',   email: 'bob@test.com',   role: 'ADMIN', createdAt: '' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll — should GET /api/users', () => {
    service.getAll().subscribe(users => {
      expect(users).toHaveLength(2);
      expect(users[0].name).toBe('Alice');
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('getById — should GET /api/users/:id', () => {
    service.getById(1).subscribe(user => {
      expect(user.id).toBe(1);
      expect(user.name).toBe('Alice');
    });

    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers[0]);
  });
});

