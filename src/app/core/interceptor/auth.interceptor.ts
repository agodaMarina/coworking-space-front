import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { FlaskApiError } from '../dtos/auth';
import { AuthService } from '../services/auth/auth.service';
import { ToastService } from '../services/toast.service';

// Mapping des error_code Flask vers des messages lisibles
const ERROR_CODE_MESSAGES: Record<string, string> = {
  INVALID_EMAIL: 'Format d\'email invalide.',
  INVALID_SLOT: 'L\'heure de début doit être avant l\'heure de fin.',
  INVALID_CAPACITY: 'La capacité doit être supérieure à 0.',
  INVALID_EQUIPMENT_NAME: 'Le nom de l\'équipement ne peut pas être vide.',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
  CANCELLATION_NOT_ALLOWED: 'L\'annulation n\'est pas autorisée pour cette salle.',
  CANCELLATION_TOO_LATE: 'Le délai d\'annulation est dépassé.',
  ROLE_CHANGE_NOT_ALLOWED: 'Vous n\'êtes pas autorisé à effectuer ce changement de rôle.',
  ROOM_NOT_FOUND: 'Salle introuvable.',
  USER_NOT_FOUND: 'Utilisateur introuvable.',
  RESERVATION_NOT_FOUND: 'Réservation introuvable.',
  EQUIPMENT_NOT_FOUND: 'Équipement introuvable.',
  TOKEN_NOT_FOUND: 'Lien de réinitialisation invalide ou déjà utilisé.',
  EMAIL_ALREADY_EXISTS: 'Cet email est déjà utilisé.',
  RESERVATION_OVERLAP: 'Ce créneau est déjà réservé ou trop proche d\'une réservation existante.',
  ROOM_ALREADY_DELETED: 'Cette salle a déjà été supprimée.',
  USER_ALREADY_DEACTIVATED: 'Cet utilisateur est déjà désactivé.',
  USER_ALREADY_ACTIVE: 'Cet utilisateur est déjà actif.',
  EQUIPMENT_ALREADY_PRESENT: 'Cet équipement est déjà associé à cette salle.',
  EQUIPMENT_NAME_ALREADY_EXISTS: 'Ce nom d\'équipement est déjà utilisé.',
  EQUIPMENT_IN_USE: 'Cet équipement est utilisé par une ou plusieurs salles.',
  CONCURRENCY_CONFLICT: 'Conflit de modification simultanée. Veuillez recharger et réessayer.',
  TOKEN_EXPIRED: 'Le lien de réinitialisation a expiré (durée de vie : 1h).',
};

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.token();

    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur est survenue.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur réseau : ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de se connecter au serveur.';
          break;
        case 401:
          this.authService.logout();
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          break;
        case 403:
          errorMessage = this.resolveFlaskError(error) ?? 'Accès refusé.';
          break;
        case 404:
          errorMessage = this.resolveFlaskError(error) ?? 'Ressource introuvable.';
          break;
        case 409:
          errorMessage = this.resolveFlaskError(error) ?? 'Conflit détecté.';
          break;
        case 410:
          errorMessage = this.resolveFlaskError(error) ?? 'Ressource expirée.';
          break;
        case 429:
          errorMessage = 'Trop de tentatives. Veuillez patienter avant de réessayer.';
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = this.resolveFlaskError(error) ?? error.statusText ?? errorMessage;
      }
    }

    this.toastService.showError(errorMessage);
    return throwError(() => error);
  }

  // Résout un message depuis le format d'erreur Flask { error_code, message, detail }
  private resolveFlaskError(error: any): string | null {
    const body = error?.error as Partial<FlaskApiError> | undefined;
    if (!body) return null;

    if (body.error_code && ERROR_CODE_MESSAGES[body.error_code]) {
      return ERROR_CODE_MESSAGES[body.error_code];
    }

    return body.message ?? null;
  }
}
