export interface User {
    id: string;
    name: string;
    email: string;
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
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    tokens: AuthTokens;
}
