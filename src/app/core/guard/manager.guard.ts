import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

// Protège les routes accessibles aux ADMIN et MANAGER (gestion des salles, équipements)
export const managerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const role = authService.user()?.role;
  if (role === 'ADMIN' || role === 'MANAGER') {
    return true;
  }

  return router.createUrlTree(['/dashboard/overview']);
};
