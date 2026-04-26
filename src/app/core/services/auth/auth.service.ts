import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminUserPayload, AdminUserUpdatePayload, AuthResponse, LoginPayload, RegisterPayload, User } from '../../dtos/auth';
import { ApiService } from '../../http/api.service';


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
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly useMocks = signal(false); // Variable pour switcher entre mocks et API

  private readonly accessTokenSignal = signal<string | null>(localStorage.getItem('coworking_access_token') ?? null);
  private readonly refreshTokenSignal = signal<string | null>(localStorage.getItem('coworking_refresh_token') ?? null);
  private readonly userSignal = signal<User | null>(readStorageUser() ?? null);

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
          user: { id: '1', username: 'admin', first_name: 'Admin', last_name: 'User', email: payload.email },
          tokens: { access: 'mock_access_token', refresh: 'mock_refresh_token' }
        };
        this.setAuthPayload(mockResponse);
        return of(mockResponse);
      } else {
        return throwError(() => new Error('Invalid credentials'));
      }
    }
    return this.http.post<AuthResponse>(this.baseUrl+'/auth/login/', payload).pipe(
      tap((response) => this.setAuthPayload(response))
    );
  }

  register(payload: RegisterPayload, loginOnSuccess = true): Observable<AuthResponse> {
    if (this.useMocks()) {
      // Mock register
      const mockResponse: AuthResponse = {
        message: 'Registration successful',
        user: { id: Date.now().toString(), username: payload.username, first_name: payload.first_name, last_name: payload.last_name, email: payload.email, role: payload.role },
        tokens: { access: 'mock_access_token', refresh: 'mock_refresh_token' }
      };
      if (loginOnSuccess) this.setAuthPayload(mockResponse);
      return of(mockResponse);
    }
    return this.http.post<AuthResponse>(this.baseUrl+'/auth/register/', payload).pipe(
      tap((response) => {
        if (loginOnSuccess) this.setAuthPayload(response);
      })
    );
  }

  logout(): void {
    const refreshToken = this.refreshTokenSignal();
    if (refreshToken) {
      this.http.post(this.baseUrl+'/auth/logout/', { refresh: refreshToken }).subscribe({
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
    return this.http.post<{ access: string }>(this.baseUrl+'/auth/token/refresh/', { refresh: refreshToken }).pipe(
      tap((data) => {
        this.accessTokenSignal.set(data.access);
      })
    );
  }

  loadProfile(): Observable<User> {
    return this.http.get<User>(this.baseUrl+'/auth/profile/').pipe(
      tap((user) => this.userSignal.set(user))
    );
  }

  getAdminUsers(): Observable<User[]> {
    return this.http
      .get<User[] | { count: number; results: User[] }>(`${this.baseUrl}/auth/admin/users/`)
      .pipe(map(res => Array.isArray(res) ? res : (res.results ?? [])));
  }

  createAdminUser(payload: AdminUserPayload): Observable<User> {
    return this.http
      .post<User | { user: User }>(`${this.baseUrl}/auth/admin/users/create/`, payload)
      .pipe(map(res => ('user' in res ? res.user : res) as User));
  }

  updateAdminUser(id: string, payload: AdminUserUpdatePayload): Observable<User> {
    return this.http
      .patch<User | { user: User }>(`${this.baseUrl}/auth/admin/users/${id}/`, payload)
      .pipe(map(res => ('user' in res ? res.user : res) as User));
  }

  deleteAdminUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/auth/admin/users/${id}/delete/`);
  }

  updateProfile(payload: { first_name?: string; last_name?: string; phone?: string }): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/auth/profile/`, payload).pipe(
      tap(user => this.userSignal.set(user))
    );
  }

  changePassword(payload: { old_password: string; new_password: string; new_password_confirm: string }): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/auth/change-password/`, payload);
  }

  private setAuthPayload(response: AuthResponse): void {
    this.accessTokenSignal.set(response.tokens.access);
    this.refreshTokenSignal.set(response.tokens.refresh);
    this.userSignal.set(response.user);
  }

  
}
