import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-space-detail-page',
  imports: [HeaderComponent, FooterComponent, RouterLink],
  template: `
    <div class="page-shell">
      <app-header></app-header>
      <main class="content-shell">
        <section class="detail-hero">
          <nav class="breadcrumb">
            <a routerLink="/spaces">Espaces</a>
            <span>&gt;</span>
            <span>{{ space.name }}</span>
          </nav>
          <div class="detail-heading">
            <div>
              <p class="space-type">{{ space.type }}</p>
              <h1>{{ space.name }}</h1>
              <p>{{ space.description }}</p>
            </div>
            <a routerLink="/booking" class="primary-button">Réserver maintenant</a>
          </div>
        </section>
        <section class="detail-features">
          <div>
            <h2>Capacité</h2>
            <p>{{ space.capacity }} personnes</p>
          </div>
          <div>
            <h2>Équipements</h2>
            <p>Wi-Fi, écran, prises, café, tableau blanc.</p>
          </div>
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
      .breadcrumb {
        display: flex;
        gap: 0.5rem;
        color: #64748b;
        margin-bottom: 1rem;
      }
      .breadcrumb a {
        color: #2563eb;
        text-decoration: none;
      }
      .detail-heading {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: start;
        flex-wrap: wrap;
      }
      .space-type {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-weight: 700;
        color: #2563eb;
      }
      h1 {
        margin: 0.5rem 0 1rem;
        font-size: clamp(2rem, 3vw, 3rem);
      }
      p {
        color: #475569;
        line-height: 1.8;
      }
      .primary-button {
        padding: 0.95rem 1.5rem;
        background: #2563eb;
        color: white;
        border-radius: 9999px;
        text-decoration: none;
        font-weight: 700;
      }
      .detail-features {
        display: grid;
        gap: 1rem;
        margin-top: 2.5rem;
      }
      .detail-features h2 {
        margin: 0 0 0.5rem;
        color: #0f172a;
      }
      .detail-features p {
        margin: 0;
      }
    `,
  ],
})
export class SpaceDetailPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly space = {
    id: this.route.snapshot.paramMap.get('id') ?? '1',
    name: 'Salle Réunion Confort',
    type: 'Salle de réunion',
    description: 'Salle équipée pour 10 personnes avec écran, visioconférence et service à disposition.',
    capacity: 10,
  };
}
