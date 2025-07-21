import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/service/AuthService';
import { MfaSetupResponse } from '../../../core/model/auth.model';


@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mfa-setup.component.html'
})
export class MfaSetupComponent implements OnInit {
  setupForm!: FormGroup;
  qrCodeData: MfaSetupResponse | null = null;
  isLoading = false;
  step: 'email' | 'qr' | 'verify' = 'email';
  currentEmail = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      verificationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.setupForm.get('email')?.setValue(currentUser.email);
      this.currentEmail = currentUser.email;
    }
  }

  setupMfa(): void {
    if (this.setupForm.get('email')?.valid) {
      this.isLoading = true;
      const email = this.setupForm.get('email')?.value;
      this.currentEmail = email;

      this.authService.setupMfa(email).subscribe({
        next: (response) => {
          console.log('MFA setup exitoso:', response);
          this.qrCodeData = response;
          this.step = 'qr';
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error configurando MFA:', error);
          this.showNotification('Error configurando MFA: ' + error.message, 'error');
          this.isLoading = false;
        }
      });
    }
  }

  proceedToVerification(): void {
    this.step = 'verify';
  }

  verifyMfa(): void {
    if (this.setupForm.get('verificationCode')?.valid) {
      this.isLoading = true;
      const code = this.setupForm.get('verificationCode')?.value;

      this.authService.verifyMfa(this.currentEmail, code).subscribe({
        next: (response) => {
          console.log('MFA habilitado exitosamente:', response);
          this.showNotification('¡MFA habilitado exitosamente!', 'success');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error verificando MFA:', error);
          this.showNotification('Código inválido. Intenta nuevamente.', 'error');
          this.setupForm.get('verificationCode')?.setValue('');
          this.isLoading = false;
        }
      });
    }
  }

  goBack(): void {
    if (this.step === 'verify') {
      this.step = 'qr';
    } else if (this.step === 'qr') {
      this.step = 'email';
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  onCodeInput(event: any): void {
    const value = event.target.value;
    const numericValue = value.replace(/\D/g, '').substring(0, 6);
    this.setupForm.get('verificationCode')?.setValue(numericValue);

    if (numericValue.length === 6) {
      setTimeout(() => this.verifyMfa(), 500);
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    const notification = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
    };

    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full ${colors[type]}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 4000);
  }
}
