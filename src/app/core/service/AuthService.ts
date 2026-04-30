import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import baserUrl from '../../shared/environments/config';
import { User, mapUserResponseToUser } from '../model/user.model';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  MfaSetupResponse,
  ApiError
} from '../model/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${baserUrl}/api/auth`;
  private isBrowser: boolean;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initializeAuth();
  }

  private initializeAuth(): void {
    if (this.isBrowser) {
      const token = this.getStoredToken();
      if (token && !this.isTokenExpired(token)) {
        // Recuperar usuario del localStorage si existe
        const userData = localStorage.getItem('user_data');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            this.setCurrentUser(user);
          } catch (error) {
            console.error('Error parsing stored user data:', error);
          }
        }
        this.setAuthenticated(true);
      } else {
        this.clearAuth();
      }
    }
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    this.setLoading(true);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest, { headers })
      .pipe(
        tap(response => {

          if (response.token) {
            this.handleAuthSuccess(response);
          }
        }),
        catchError(error => {
          return this.handleError(error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    this.setLoading(true);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerRequest, { headers })
      .pipe(
        tap(response => {
          if (response.token) {
            this.handleAuthSuccess(response);
          }
        }),
        catchError(error => {
          return this.handleError(error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  setupMfa(email: string): Observable<MfaSetupResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<MfaSetupResponse>(`${this.apiUrl}/setup-mfa?email=${email}`, {}, { headers })
      .pipe(
        catchError(error => {
          return this.handleError(error);
        })
      );
  }

  verifyMfa(email: string, code: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-mfa?email=${email}&code=${code}`, {}, { headers })
      .pipe(
        tap(response => {
          if (response.token) {
            this.handleAuthSuccess(response);
          }
        }),
        catchError(error => {
          return this.handleError(error);
        })
      );
  }

  private handleAuthSuccess(response: AuthResponse): void {

    if (this.isBrowser) {
      this.storeToken(response.token);

      if (response.expiresIn) {
        const expirationTime = new Date().getTime() + (response.expiresIn * 1000);
        localStorage.setItem('token_expiration', expirationTime.toString());
      }
    }
    const user = mapUserResponseToUser(response.user);
    this.setCurrentUser(user);
    this.setAuthenticated(true);
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/auth']);
  }

  private clearAuth(): void {
    if (this.isBrowser) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('token_expiration');
      localStorage.removeItem('user_data');
    }
    this.setCurrentUser(null);
    this.setAuthenticated(false);
  }

  getToken(): string | null {
    return this.getStoredToken();
  }

  setToken(token: string): void {
    this.storeToken(token);
  }

  private getStoredToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('jwt');
    }
    return null;
  }

  private storeToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('jwt', token);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    if (this.isBrowser) {
      if (user) {
        localStorage.setItem('user_data', JSON.stringify(user));
      } else {
        localStorage.removeItem('user_data');
      }
    }
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private setAuthenticated(isAuth: boolean): void {
    this.isAuthenticatedSubject.next(isAuth);
  }

  private setLoading(loading: boolean): void {
    this.isLoadingSubject.next(loading);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error) {
      if (error.error.message) {
        errorMessage = error.error.message;
      }
      if (error.error.code) {
        errorCode = error.error.code;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    const isAuthPage = this.router.url.includes('/auth') || this.router.url.includes('/mfa-setup');
    
    if (error.status === 401 && !isAuthPage) {
      this.clearAuth();
      this.router.navigate(['/auth']);
    }


    return throwError(() => ({
      code: errorCode,
      message: errorMessage,
      status: error.status,
      originalError: error
    }));
  }
}
