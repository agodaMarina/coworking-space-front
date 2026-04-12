import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [RouterLink],
  template: `
    <header class="header-shell">
      <div class="header-brand">
        <a routerLink="/home" class="brand-link">Cowork</a>
      </div>
      <nav class="header-nav">
        <a routerLink="/spaces">Espaces</a>
        <a routerLink="/booking">Réservation</a>
        <a routerLink="/login" class="header-action">Connexion</a>
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
export class HeaderComponent {}
