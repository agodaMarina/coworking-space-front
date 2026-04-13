import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './services/toast.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.token();

    if (!token) {
      return next.handle(req).pipe(
        catchError(error => this.handleError(error))
      );
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(authReq).pipe(
      catchError(error => this.handleError(error, authReq))
    );
  }

  private handleError(error: any, req?: HttpRequest<unknown>): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        // Unauthorized - clear auth
        this.authService.logout();
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.status === 403) {
        errorMessage = 'Accès refusé.';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée.';
      } else if (error.status === 500 || error.status === 502 || error.status === 503) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
      } else if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur.';
      } else if (error.error?.detail) {
        errorMessage = error.error.detail;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.statusText) {
        errorMessage = error.statusText;
      }
    }

    this.toastService.showError(errorMessage);
    return throwError(() => error);
  }
}
