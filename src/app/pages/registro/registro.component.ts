import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { AuthService } from '../../core/service/AuthService';
import { LoginRequest, RegisterRequest } from '../../core/model/auth.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate(
          '300ms ease-in',
          style({ transform: 'translateX(0%)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate(
          '400ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
    ]),
    // Animaciones para el modal MFA
    trigger('modalFadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('modalSlideIn', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'scale(0.95) translateY(20px)',
        }),
        animate(
          '300ms ease-out',
          style({
            opacity: 1,
            transform: 'scale(1) translateY(0)',
          })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({
            opacity: 0,
            transform: 'scale(0.95) translateY(20px)',
          })
        ),
      ]),
    ]),
  ],
})
export class RegistroComponent implements OnInit {
  isRegisterForm: boolean = true;

  // Visibilidad de contraseñas
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  loginPasswordVisible: boolean = false;

  // Formularios reactivos
  registerForm!: FormGroup;
  loginForm!: FormGroup;
  mfaForm!: FormGroup;

  // Estados de carga
  isRegisterLoading: boolean = false;
  isLoginLoading: boolean = false;
  isMfaLoading: boolean = false;

  // MFA
  showMfaInput: boolean = false;
  requiresMfaEmail: string = '';

  // Indicador de fuerza de contraseña
  passwordStrength = {
    score: 0,
    feedback: 'Mínimo 8 caracteres',
    color: 'bg-red-500',
  };

  // Mensajes de error
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.authService.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  // Inicializar formularios reactivos
  initializeForms(): void {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        telefono: [
          '',
          [Validators.required, Validators.pattern(/^[\+]?[\d\s\-\(\)]+$/)],
        ],
        dni: ['', [Validators.pattern(/^\d{8}$/)]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordValidator,
          ],
        ],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator }
    );

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });

    this.mfaForm = this.fb.group({
      mfaCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });

    this.registerForm.get('password')?.valueChanges.subscribe((password) => {
      if (password) {
        this.updatePasswordStrength(password);
      }
    });
  }

  passwordValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);
    const isLengthValid = value.length >= 8;

    const passwordValid =
      hasNumber && hasUpper && hasLower && hasSymbol && isLengthValid;
    return passwordValid ? null : { passwordStrength: true };
  }

  passwordMatchValidator(form: AbstractControl): { [key: string]: any } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  updatePasswordStrength(password: string): void {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push('mínimo 8 caracteres');
    if (password.match(/[a-z]/)) score++;
    else feedback.push('una minúscula');
    if (password.match(/[A-Z]/)) score++;
    else feedback.push('una mayúscula');
    if (password.match(/[0-9]/)) score++;
    else feedback.push('un número');
    if (password.match(/[^a-zA-Z0-9]/)) score++;
    else feedback.push('un símbolo');

    this.passwordStrength = {
      score: score,
      feedback:
        score === 5
          ? '¡Contraseña fuerte!'
          : `Falta: ${feedback.slice(0, 2).join(', ')}`,
      color:
        score <= 2
          ? 'bg-red-500'
          : score <= 4
          ? 'bg-yellow-500'
          : 'bg-green-500',
    };
  }

  toggleForm(): void {
    this.isRegisterForm = !this.isRegisterForm;
    this.errorMessage = null;
    this.resetForms();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  toggleLoginPasswordVisibility(): void {
    this.loginPasswordVisible = !this.loginPasswordVisible;
  }

  resetForms(): void {
    this.registerForm.reset();
    this.loginForm.reset();
    this.mfaForm.reset();
    this.isRegisterLoading = false;
    this.isLoginLoading = false;
    this.isMfaLoading = false;
    this.showMfaInput = false;
    this.requiresMfaEmail = '';
    this.passwordStrength = {
      score: 0,
      feedback: 'Mínimo 8 caracteres',
      color: 'bg-red-500',
    };
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isRegisterLoading = true;

      const registerData: RegisterRequest = {
        email: this.registerForm.get('email')?.value,
        nombre: this.registerForm.get('nombre')?.value,
        apellido: this.registerForm.get('apellido')?.value,
        telefono: this.registerForm.get('telefono')?.value,
        password: this.registerForm.get('password')?.value,
        dni: this.registerForm.get('dni')?.value || '',
      };

      console.log('📤 Enviando datos de registro:', registerData);

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.handleAuthSuccess(
            '¡Registro exitoso! Redirigiendo al dashboard...'
          );
        },
        error: (error) => {
          console.error('Error en registro:', error);
          this.handleAuthError(error);
        },
        complete: () => {
          this.isRegisterLoading = false;
        },
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
      this.showNotification(
        'Por favor completa todos los campos requeridos',
        'error'
      );
    }
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoginLoading = true;

      const loginData: LoginRequest = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value,
        rememberMe: this.loginForm.get('rememberMe')?.value,
      };

      console.log('Enviando datos de login:', loginData);

      this.authService.login(loginData).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);

          this.handleAuthSuccess('¡Login exitoso! Redirigiendo...');
        },
        error: (error) => {
          console.error('Error en login:', error);

          if (error.message && error.message.includes('Código MFA requerido')) {
            this.requiresMfaEmail = loginData.email;
            this.showMfaInput = true;
            this.isLoginLoading = false;
            this.showNotification(
              'Ingresa tu código de Google Authenticator',
              'info'
            );
          } else {
            this.handleAuthError(error);
          }
        },
        complete: () => {
          if (!this.showMfaInput) {
            this.isLoginLoading = false;
          }
        },
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
      this.showNotification('Por favor completa todos los campos', 'error');
    }
  }

  onVerifyMfa(): void {
    if (this.mfaForm.valid && this.requiresMfaEmail) {
      this.isMfaLoading = true;
      const mfaCode = this.mfaForm.get('mfaCode')?.value;

      const loginDataWithMfa: LoginRequest = {
        email: this.requiresMfaEmail,
        password: this.loginForm.get('password')?.value,
        mfaCode: mfaCode,
      };

      console.log('Verificando MFA:', {
        email: loginDataWithMfa.email,
        mfaCode,
      });

      this.authService.login(loginDataWithMfa).subscribe({
        next: (response) => {
          console.log('MFA verificado exitosamente:', response);
          this.showMfaInput = false;
          this.handleAuthSuccess('¡Autenticación exitosa!');
        },
        error: (error) => {
          console.error('Error en MFA:', error);
          this.handleAuthError(error);
          this.mfaForm.get('mfaCode')?.setValue('');
        },
        complete: () => {
          this.isMfaLoading = false;
        },
      });
    } else {
      this.markFormGroupTouched(this.mfaForm);
      this.showNotification('Ingresa un código de 6 dígitos válido', 'error');
    }
  }

  cancelMfa(): void {
    this.showMfaInput = false;
    this.requiresMfaEmail = '';
    this.mfaForm.reset();
    this.isLoginLoading = false;
    this.isMfaLoading = false;
  }

  private handleAuthSuccess(message: string): void {
    console.log('Auth Success:', message);
    this.showNotification(message, 'success');

    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1500);
  }

  private handleAuthError(error: any): void {
    console.error('Auth Error completo:', error);

    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.message) {
      switch (error.message) {
        case 'Código MFA requerido':
          errorMessage = 'Se requiere código de autenticación de dos factores';
          break;
        case 'Código MFA inválido':
          errorMessage =
            'El código ingresado es incorrecto. Intenta nuevamente.';
          break;
        case 'Código MFA debe tener 6 dígitos':
          errorMessage = 'El código debe tener exactamente 6 dígitos';
          break;
        case 'Credenciales inválidas':
          errorMessage = 'Email o contraseña incorrectos';
          break;
        default:
          errorMessage = error.message;
      }
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    this.errorMessage = errorMessage;
    this.showNotification(errorMessage, 'error');

    this.isRegisterLoading = false;
    this.isLoginLoading = false;
    this.isMfaLoading = false;
  }

  private showNotification(
    message: string,
    type: 'success' | 'error' | 'info'
  ): void {
    const notification = document.createElement('div');

    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
    };

    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      info: 'fas fa-info-circle',
    };

    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full ${colors[type]}`;

    notification.innerHTML = `
      <div class="flex items-center">
        <i class="${icons[type]} mr-3"></i>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  onSocialLogin(provider: string): void {
    console.log(`Iniciando sesión con ${provider}`);
    this.showNotification(`Login con ${provider} no implementado aún`, 'info');

  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required'])
        return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['email']) return 'Ingresa un email válido';
      if (field.errors['minlength'])
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) {
        if (fieldName === 'phone') return 'Formato de teléfono inválido';
        if (fieldName === 'mfaCode')
          return 'El código debe tener exactamente 6 dígitos';
        return 'Formato inválido';
      }
      if (field.errors['passwordStrength'])
        return 'La contraseña no cumple los requisitos de seguridad';
    }

    if (fieldName === 'confirmPassword' && form.errors?.['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'El email',
      nombre: 'El nombre',
      apellido: 'El apellido',
      telefono: 'El teléfono',
      dni: 'El DNI',
      password: 'La contraseña',
      confirmPassword: 'La confirmación de contraseña',
      terms: 'Los términos y condiciones',
      mfaCode: 'El código MFA',
    };
    return labels[fieldName] || 'Este campo';
  }

  private extractFirstName(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts[0] || '';
  }

  private extractLastName(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts.slice(1).join(' ') || '';
  }


  get isLoading(): boolean {
    if (this.showMfaInput) return this.isMfaLoading;
    return this.isRegisterForm ? this.isRegisterLoading : this.isLoginLoading;
  }

  get submitButtonText(): string {
    if (this.showMfaInput) {
      return this.isMfaLoading ? 'Verificando...' : 'Verificar Código';
    }

    if (this.isRegisterForm) {
      return this.isRegisterLoading ? 'Creando cuenta...' : 'Crear mi cuenta';
    } else {
      return this.isLoginLoading ? 'Iniciando sesión...' : 'Iniciar sesión';
    }
  }

  get submitButtonIcon(): string {
    if (this.isLoading) {
      return 'fas fa-spinner fa-spin';
    }

    if (this.showMfaInput) {
      return 'fas fa-shield-alt';
    }

    return this.isRegisterForm ? 'fas fa-user-plus' : 'fas fa-sign-in-alt';
  }

  get anyFormLoading(): boolean {
    return this.isRegisterLoading || this.isLoginLoading || this.isMfaLoading;
  }
  onMfaCodeInput(event: any): void {
    const value = event.target.value;
    this.errorMessage = null;
    // Solo permitir números y máximo 6 dígitos
    const numericValue = value.replace(/\D/g, '').substring(0, 6);
    this.mfaForm.get('mfaCode')?.setValue(numericValue);

    // Auto-submit cuando tenga 6 dígitos
    if (numericValue.length === 6) {
      setTimeout(() => this.onVerifyMfa(), 500);
    }
  }
}
