export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  role: 'USER' | 'ADMIN';
  mfaEnabled: boolean;
  profileComplete?: boolean;
  lastLoginAt?: string;
}

export function mapUserResponseToUser(userResponse: UserResponse): User {
  return {
    id: userResponse.id,
    email: userResponse.email,
    nombre: userResponse.nombre,
    apellido: userResponse.apellido,
    telefono: userResponse.telefono,
    role: userResponse.role as 'USER' | 'ADMIN',
    mfaEnabled: userResponse.mfa_enabled,
    profileComplete: true,
    lastLoginAt: new Date().toISOString()
  };
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
