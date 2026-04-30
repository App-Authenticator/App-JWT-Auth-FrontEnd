import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baserUrl from '../../shared/environments/config';
import { UserResponse, Role } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${baserUrl}/api/admin/users`;
  private rolesUrl = `${baserUrl}/api/roles`;

  constructor(private http: HttpClient) {}

  // Usuarios
  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl);
  }

  updateUserRoles(userId: number, roles: string[]): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${userId}/roles`, roles);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  // Roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.rolesUrl);
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(this.rolesUrl, role);
  }

  deleteRole(roleId: number): Observable<void> {
    return this.http.delete<void>(`${this.rolesUrl}/${roleId}`);
  }
}
