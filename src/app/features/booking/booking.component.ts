import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-booking-page',
  imports: [HeaderComponent, FooterComponent, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-shell">
      <app-header></app-header>
      <main class="content-shell">
        <section class="booking-hero">
          <div>
            <p class="eyebrow">Réservation</p>
            <h1>Choisissez votre espace et vos créneaux</h1>
            <p>Organisez votre journée dans un espace adapté à votre activité.</p>
          </div>
          <div class="booking-action">
            <p>Connecté en tant que <strong>{{ authService.user()?.name ?? 'utilisateur' }}</strong></p>
            <a routerLink="/spaces" class="link-button">Voir les espaces</a>
          </div>
        </section>
        <section class="booking-panel">
          <form [formGroup]="bookingForm" (ngSubmit)="submit()">
            <label>
              Type de réservation
              <select formControlName="type">
                <option value="workspace">Espace de travail</option>
                <option value="meeting_room">Salle de réunion</option>
              </select>
            </label>
            <label>
              Date
              <input type="date" formControlName="date" />
            </label>
            <label>
              Heure de début
              <input type="time" formControlName="startTime" />
            </label>
            <label>
              Durée (heures)
              <input type="number" formControlName="duration" min="1" max="10" />
            </label>
            <label>
              Nombre de personnes
              <input type="number" formControlName="capacity" min="1" max="20" />
            </label>
            <button type="submit" [disabled]="submitting()">Réserver</button>
          </form>
          <div class="booking-summary">
            <h2>Résumé</h2>
            <p>Sélectionnez votre créneau et confirmez votre réservation.</p>
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
      .booking-hero {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: #2563eb;
        font-weight: 700;
        margin-bottom: 0.75rem;
      }
      h1 {
        margin: 0;
        font-size: clamp(2rem, 3vw, 3rem);
        color: #0f172a;
      }
      .booking-action {
        display: grid;
        gap: 0.75rem;
        align-items: center;
        justify-items: end;
      }
      .link-button {
        display: inline-flex;
        padding: 0.85rem 1.25rem;
        border-radius: 9999px;
        text-decoration: none;
        background: #e2e8f0;
        color: #0f172a;
      }
      .booking-panel {
        display: grid;
        grid-template-columns: 1.45fr 1fr;
        gap: 1.5rem;
      }
      form {
        display: grid;
        gap: 1rem;
        background: white;
        padding: 1.5rem;
        border-radius: 1.25rem;
        border: 1px solid rgba(148, 163, 184, 0.18);
      }
      label {
        display: grid;
        gap: 0.5rem;
        color: #334155;
        font-weight: 600;
      }
      input,
      select {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: 0.85rem;
        padding: 0.95rem 1rem;
        font-size: 1rem;
        color: #0f172a;
      }
      button {
        width: 100%;
        border: none;
        border-radius: 0.95rem;
        padding: 0.95rem 1rem;
        background: #2563eb;
        color: white;
        font-weight: 700;
        cursor: pointer;
      }
      .booking-summary {
        background: #ffffff;
        border-radius: 1.25rem;
        padding: 1.5rem;
        border: 1px solid rgba(148, 163, 184, 0.18);
      }
      .booking-summary h2 {
        margin: 0 0 1rem;
      }
    `,
  ],
})
export class BookingPageComponent {
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly submitting = signal(false);

  readonly bookingForm = this.fb.group({
    type: ['workspace', Validators.required],
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    duration: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
    capacity: [1, [Validators.required, Validators.min(1)]],
  });

  submit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      alert('Réservation simulée réussie.');
    }, 750);
  }
}
