// DTOs liés à l'authentification Flask ShareRoom API
// Roles utilisés par l'API Flask (toujours en majuscules)
export type UserRole = 'CLIENT' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// L'API Flask retourne uniquement un access_token (pas de refresh)
export interface LoginResponse {
  access_token: string;
  user_id: string;
  role: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// Réponse 201 — utilisateur créé (pas de token, redirection vers login)
export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface UserRolePayload {
  role: UserRole;
}

// Réponse générique de l'API Flask pour les messages simples
export interface ApiMessageResponse {
  message: string;
}

// Format standard d'erreur Flask
export interface FlaskApiError {
  error_code: string;
  message: string;
  detail?: Record<string, unknown>;
}
