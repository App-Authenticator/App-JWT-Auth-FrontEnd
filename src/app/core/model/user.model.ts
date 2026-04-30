export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  roles: string[];
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
    roles: userResponse.roles || [],
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
  roles: string[];
  mfa_enabled: boolean;
}

export interface Role {
  id: number;
  name: string;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  owner_id?: number;
}
