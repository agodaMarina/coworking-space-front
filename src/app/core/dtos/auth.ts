export interface User {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    phone?: string | null;
    avatar?: string | null;
    role?: string;
    is_verified?: boolean;
    created_at?: string;
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
    password_confirm: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    tokens: AuthTokens;
}
