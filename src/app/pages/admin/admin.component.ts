import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../core/service/AdminService';
import { UserResponse, Role } from '../../core/model/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: UserResponse[] = [];
  roles: Role[] = [];
  newRoleName: string = '';

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.adminService.getUsers().subscribe(users => this.users = users);
    this.adminService.getRoles().subscribe(roles => this.roles = roles);
  }

  addRole(userId: number, roleName: string): void {
    const user = this.users.find(u => u.id === userId);
    if (user && !user.roles.includes(roleName)) {
      const newRoles = [...user.roles, roleName];
      this.adminService.updateUserRoles(userId, newRoles).subscribe(() => this.loadData());
    }
  }

  removeRole(userId: number, roleName: string): void {
    const user = this.users.find(u => u.id === userId);
    if (user && user.roles.includes(roleName)) {
      const newRoles = user.roles.filter(r => r !== roleName);
      if (newRoles.length === 0) {
        alert('Un usuario debe tener al menos un rol.');
        return;
      }
      this.adminService.updateUserRoles(userId, newRoles).subscribe(() => this.loadData());
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  deleteUser(id: number): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.adminService.deleteUser(id).subscribe(() => this.loadData());
    }
  }
}
