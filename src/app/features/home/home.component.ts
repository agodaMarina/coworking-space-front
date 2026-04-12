import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [HeaderComponent, FooterComponent, RouterLink],
  template: `
    <div class="page-shell">
      <app-header></app-header>
      <section class="hero-shell">
        <div>
          <p class="eyebrow">Réservez un espace de coworking ou une salle de réunion</p>
          <h1>Travaillez mieux, ensemble.</h1>
          <p>Découvrez des espaces flexibles, des salles équipées et des services pensés pour vos équipes.</p>
          <div class="hero-actions">
            <a routerLink="/spaces" class="primary-button">Voir les espaces</a>
            <a routerLink="/booking" class="secondary-button">Faire une réservation</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card">Espace moderne, Wi-Fi, café inclus.</div>
        </div>
      </section>
      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `
      .page-shell {
        min-height: 100vh;
        background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 40%), #ffffff;
        display: flex;
        flex-direction: column;
      }
      .hero-shell {
        max-width: 1100px;
        margin: 0 auto;
        padding: 3rem 1.5rem 4rem;
        display: grid;
        gap: 2rem;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: #2563eb;
        font-weight: 700;
        margin-bottom: 1rem;
      }
      h1 {
        font-size: clamp(2.25rem, 3vw, 3.75rem);
        margin: 0 0 1rem;
        color: #0f172a;
        line-height: 1.05;
      }
      p {
        color: #475569;
        max-width: 38rem;
        line-height: 1.75;
      }
      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 2rem;
      }
      .primary-button,
      .secondary-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.95rem 1.4rem;
        border-radius: 9999px;
        font-weight: 600;
      }
      .primary-button {
        background: #2563eb;
        color: white;
      }
      .secondary-button {
        background: #e2e8f0;
        color: #0f172a;
      }
      .hero-visual {
        display: flex;
        justify-content: center;
      }
      .hero-card {
        width: min(100%, 500px);
        min-height: 320px;
        border-radius: 2rem;
        background: linear-gradient(180deg, rgba(37, 99, 235, 0.15), #eff6ff);
        display: grid;
        place-items: center;
        color: #0f172a;
        text-align: center;
        padding: 2rem;
        font-weight: 700;
      }
    `,
  ]
})
export class HomePageComponent {}
