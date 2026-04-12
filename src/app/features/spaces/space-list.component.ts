import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-space-list-page',
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink],
  template: `
    <div class="page-shell">
      <app-header></app-header>
      <main class="content-shell">
        <section class="listing-hero">
          <h1>Nos espaces</h1>
          <p>Choisissez l’espace ou la salle de réunion qui correspond à votre équipe.</p>
        </section>
        <section class="space-grid">
          <article class="space-card" *ngFor="let space of spaces">
            <div>
              <p class="space-type">{{ space.type }}</p>
              <h2>{{ space.name }}</h2>
              <p>{{ space.description }}</p>
            </div>
            <div class="space-meta">
              <span>{{ space.capacity }} personnes</span>
              <a [routerLink]="['/spaces', space.id]">Voir</a>
            </div>
          </article>
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
        width: min(1200px, 100%);
        margin: 0 auto;
        padding: 2rem 1.5rem 4rem;
      }
      .listing-hero {
        margin-bottom: 2rem;
      }
      .listing-hero h1 {
        margin: 0 0 0.75rem;
        font-size: 2.5rem;
        color: #0f172a;
      }
      .listing-hero p {
        margin: 0;
        color: #475569;
      }
      .space-grid {
        display: grid;
        gap: 1.5rem;
      }
      .space-card {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.5rem;
        border-radius: 1.25rem;
        background: white;
        border: 1px solid rgba(148, 163, 184, 0.24);
      }
      .space-type {
        margin: 0 0 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #2563eb;
        font-size: 0.8rem;
        font-weight: 700;
      }
      .space-card h2 {
        margin: 0 0 0.75rem;
        color: #0f172a;
      }
      .space-card p {
        margin: 0;
        color: #475569;
      }
      .space-meta {
        display: grid;
        justify-content: end;
        gap: 0.75rem;
        text-align: right;
      }
      .space-meta span {
        font-weight: 700;
        color: #0f172a;
      }
      .space-meta a {
        color: #2563eb;
        text-decoration: none;
      }
    `,
  ],
})
export class SpaceListPageComponent {
  readonly spaces = [
    {
      id: '1',
      name: 'Open Space Lumière',
      type: 'Open space',
      description: 'Grande surface partagée avec postes flexibles et café à volonté.',
      capacity: 18,
    },
    {
      id: '2',
      name: 'Salle Réunion Confort',
      type: 'Salle de réunion',
      description: 'Salle équipée pour 10 personnes, écran et visioconférence.',
      capacity: 10,
    },
    {
      id: '3',
      name: 'Bureau Privé Premium',
      type: 'Bureau privé',
      description: 'Bureau fermé pour 4 personnes avec confidentialité et calme.',
      capacity: 4,
    },
  ];
}
