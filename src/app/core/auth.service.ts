import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, of, tap, throwError } from 'rxjs';

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

function readStorageUser(): User | null {
  const raw = localStorage.getItem('coworking_user');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly useMocks = signal(false); // Variable pour switcher entre mocks et API

  private readonly accessTokenSignal = signal<string | null>(localStorage.getItem('coworking_access_token'));
  private readonly refreshTokenSignal = signal<string | null>(localStorage.getItem('coworking_refresh_token'));
  private readonly userSignal = signal<User | null>(readStorageUser());

  readonly isAuthenticated = computed(() => !!this.accessTokenSignal());
  readonly token = computed(() => this.accessTokenSignal());
  readonly user = this.userSignal;

  toggleMocks(): void {
    this.useMocks.set(!this.useMocks());
  }

  constructor() {
    effect(() => {
      const accessToken = this.accessTokenSignal();
      if (accessToken) {
        localStorage.setItem('coworking_access_token', accessToken);
      } else {
        localStorage.removeItem('coworking_access_token');
      }

      const refreshToken = this.refreshTokenSignal();
      if (refreshToken) {
        localStorage.setItem('coworking_refresh_token', refreshToken);
      } else {
        localStorage.removeItem('coworking_refresh_token');
      }
    });

    effect(() => {
      const user = this.userSignal();
      if (user) {
        localStorage.setItem('coworking_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('coworking_user');
      }
    });

    if (this.accessTokenSignal() && !this.userSignal()) {
      this.loadProfile().subscribe({
        error: () => this.logout(),
      });
    }
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    if (this.useMocks()) {
      // Mock login
      if (payload.email === 'admin@coworking.com' && payload.password === 'admin1234') {
        const mockResponse: AuthResponse = {
          message: 'Login successful',
          user: { id: '1', name: 'Admin User', email: payload.email },
          tokens: { access: 'mock_access_token', refresh: 'mock_refresh_token' }
        };
        this.setAuthPayload(mockResponse);
        return of(mockResponse);
      } else {
        return throwError(() => new Error('Invalid credentials'));
      }
    }
    return this.http.post<AuthResponse>('/api/auth/login/', payload).pipe(
      tap((response) => this.setAuthPayload(response))
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    if (this.useMocks()) {
      // Mock register
      const mockResponse: AuthResponse = {
        message: 'Registration successful',
        user: { id: Date.now().toString(), name: payload.name, email: payload.email },
        tokens: { access: 'mock_access_token', refresh: 'mock_refresh_token' }
      };
      this.setAuthPayload(mockResponse);
      return of(mockResponse);
    }
    return this.http.post<AuthResponse>('/api/auth/register/', payload).pipe(
      tap((response) => this.setAuthPayload(response))
    );
  }

  logout(): void {
    const refreshToken = this.refreshTokenSignal();
    if (refreshToken) {
      this.http.post('/api/auth/logout/', { refresh: refreshToken }).subscribe({
        next: () => {},
        error: () => {},
      });
    }

    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.userSignal.set(null);
  }

  refreshAccessToken(): Observable<{ access: string }> {
    const refreshToken = this.refreshTokenSignal();
    return this.http.post<{ access: string }>('/api/auth/token/refresh/', { refresh: refreshToken }).pipe(
      tap((data) => {
        this.accessTokenSignal.set(data.access);
      })
    );
  }

  loadProfile(): Observable<User> {
    return this.http.get<User>('/api/auth/profile/').pipe(
      tap((user) => this.userSignal.set(user))
    );
  }

  private setAuthPayload(response: AuthResponse): void {
    this.accessTokenSignal.set(response.tokens.access);
    this.refreshTokenSignal.set(response.tokens.refresh);
    this.userSignal.set(response.user);
  }
}
