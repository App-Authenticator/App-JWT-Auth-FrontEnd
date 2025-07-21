export interface ApiError {
  code: string;
  message: string;
  timestamp: string;
  details?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

export interface RegisterRequest {
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  password: string;
  dni?: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
  type: string;
  expiresIn?: number;
  mfaSetup?: MfaSetupResponse;
}

export interface UserResponse {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  role: string;
  mfa_enabled: boolean;
}

export interface MfaSetupResponse {
  qr_code_image: string;
  secret: string;
  qr_code_url: string;
  message: string;
}
