import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest, PageResponse } from '../models/user.types';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getAll(page: number = 0, size: number = 5): Observable<PageResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<User>>(`${environment.apiUrl}/user`, { params });
  }

  create(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/user/register`, request);
  }

  update(id: number, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/user/${id}`, request);
  }

  disable(id: number): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/user/${id}/disable`, {});
  }

  enable(id: number): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/user/${id}/enable`, {});
  }
}
