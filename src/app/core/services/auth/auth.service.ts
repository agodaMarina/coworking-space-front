import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiMessageResponse,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  User,
  UserRolePayload,
  UserUpdatePayload,
} from '../../dtos/auth';

function readStorageUser(): User | null {
  const raw = localStorage.getItem('shareroom_user');
  if (!raw) return null;
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

  private readonly accessTokenSignal = signal<string | null>(
    localStorage.getItem('shareroom_access_token') ?? null
  );
  private readonly userSignal = signal<User | null>(readStorageUser());

  readonly isAuthenticated = computed(() => !!this.accessTokenSignal());
  readonly token = computed(() => this.accessTokenSignal());
  readonly user = this.userSignal.asReadonly();

  constructor() {
    effect(() => {
      const token = this.accessTokenSignal();
      if (token) {
        localStorage.setItem('shareroom_access_token', token);
      } else {
        localStorage.removeItem('shareroom_access_token');
      }
    });

    effect(() => {
      const user = this.userSignal();
      if (user) {
        localStorage.setItem('shareroom_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('shareroom_user');
      }
    });

    // Recharger le profil si token présent mais user absent
    if (this.accessTokenSignal() && !this.userSignal()) {
      this.loadProfile().subscribe({ error: () => this.clearSession() });
    }
  }

  // ── Authentification ────────────────────────────────────────────────────────

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap((res) => {
        this.accessTokenSignal.set(res.access_token);
        // Le profil complet est chargé séparément via loadProfile()
        this.loadProfile().subscribe();
      })
    );
  }

  register(payload: RegisterPayload): Observable<RegisterResponse> {
    // Pas d'auto-login : l'API retourne juste l'utilisateur créé, rediriger vers /login
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, payload);
  }

  logout(): void {
    if (this.accessTokenSignal()) {
      this.http.post(`${this.baseUrl}/auth/logout`, {}).subscribe({
        error: () => {},
      });
    }
    this.clearSession();
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.baseUrl}/auth/forgot-password`, payload);
  }

  resetPassword(payload: ResetPasswordPayload): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.baseUrl}/auth/reset-password`, payload);
  }

  // ── Profil utilisateur ──────────────────────────────────────────────────────

  loadProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/me`).pipe(
      tap((user) => this.userSignal.set(user))
    );
  }

  updateProfile(payload: UserUpdatePayload): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/me`, payload).pipe(
      tap((user) => this.userSignal.set(user))
    );
  }

  // ── Administration utilisateurs (ADMIN uniquement) ──────────────────────────

  deactivateUser(userId: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users/${userId}/deactivate`, {});
  }

  activateUser(userId: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users/${userId}/activate`, {});
  }

  changeUserRole(userId: string, payload: UserRolePayload): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${userId}/role`, payload);
  }

  // ── Utilitaires ─────────────────────────────────────────────────────────────

  private clearSession(): void {
    this.accessTokenSignal.set(null);
    this.userSignal.set(null);
  }
}
