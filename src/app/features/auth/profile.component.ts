import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-profile-page',
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink],
  template: `
    <div class="page-shell">
      <app-header></app-header>
      <main class="content-shell">
        <section class="profile-hero">
          <h1>Mon profil</h1>
          <p>Gérez votre compte et vos informations de réservation.</p>
        </section>
        <section class="profile-card">
          <div *ngIf="user(); else loading">
            <p class="profile-label">Nom complet</p>
            <h2>{{ user()?.name }}</h2>
            <p class="profile-label">Email</p>
            <p>{{ user()?.email }}</p>
            <a routerLink="/booking" class="primary-button">Voir mes réservations</a>
          </div>
          <ng-template #loading>
            <p>Chargement du profil...</p>
          </ng-template>
        </section>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `
      .page-shell {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: #f8fafc;
      }
      .content-shell {
        width: min(1100px, 100%);
        margin: 0 auto;
        padding: 2rem 1.5rem 4rem;
      }
      .profile-hero h1 {
        margin: 0 0 0.75rem;
        font-size: clamp(2rem, 3vw, 3rem);
        color: #0f172a;
      }
      .profile-hero p {
        margin: 0;
        color: #475569;
      }
      .profile-card {
        margin-top: 2rem;
        background: white;
        border-radius: 1.5rem;
        padding: 2rem;
        border: 1px solid rgba(148, 163, 184, 0.2);
        display: grid;
        gap: 1rem;
      }
      .profile-label {
        margin: 0;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 0.85rem;
      }
      h2 {
        margin: 0 0 1.25rem;
        color: #0f172a;
      }
      .primary-button {
        display: inline-flex;
        padding: 0.95rem 1.4rem;
        border-radius: 9999px;
        background: #2563eb;
        color: white;
        text-decoration: none;
        font-weight: 700;
      }
    `,
  ],
})
export class ProfilePageComponent {
  readonly authService = inject(AuthService);

  user = this.authService.user;
}
