import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/AuthService';
import { User } from '../../core/model/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Usuario actual en Dashboard:', user);
      console.log('Roles detectados:', user?.roles);
      if (!user) {
        this.router.navigate(['/auth']);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  goToMfaSetup(): void {
    this.router.navigate(['/mfa-setup']);
  }

  isAdmin(): boolean {
    if (!this.currentUser || !this.currentUser.roles) return false;
    return this.currentUser.roles.some(role => 
      role.toUpperCase() === 'ADMIN' || role.toUpperCase() === 'ROLE_ADMIN'
    );
  }

  goToAdmin(): void {
    console.log('Navegando a Panel Admin...');
    this.router.navigate(['/admin']);
  }

  goToProducts(): void {
    console.log('Navegando a Productos...');
    this.router.navigate(['/products']);
  }
}
