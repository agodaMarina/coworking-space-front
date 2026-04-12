import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header-shell">
      <div class="header-brand">
        <a routerLink="/home" class="brand-link">Cowork</a>
      </div>
      <nav class="header-nav">
        <a routerLink="/spaces">Espaces</a>
        <a routerLink="/booking">Réservation</a>
        <ng-container *ngIf="authService.isAuthenticated(); else authLinks">
          <a routerLink="/profile">Mon compte</a>
          <button type="button" class="header-action" (click)="logout()">Déconnexion</button>
        </ng-container>
        <ng-template #authLinks>
          <a routerLink="/login" class="header-action">Connexion</a>
        </ng-template>
      </nav>
    </header>
  `,
  styles: [
    `
      .header-shell {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        gap: 1rem;
        background: #ffffff;
        border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .header-brand .brand-link {
        font-size: 1.1rem;
        font-weight: 700;
        color: #0f172a;
      }

      .header-nav {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .header-nav a {
        color: #334155;
        text-decoration: none;
        font-weight: 500;
      }

      .header-action {
        padding: 0.7rem 1rem;
        border-radius: 9999px;
        background: #2563eb;
        color: #ffffff;
      }
    `,
  ]
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}

