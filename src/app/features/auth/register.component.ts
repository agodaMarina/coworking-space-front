import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-panel">
        <h1>Créer un compte</h1>
        <p>Inscrivez-vous et commencez à réserver des espaces en quelques clics.</p>
        <form [formGroup]="registerForm" (ngSubmit)="submit()">
          <label>
            Nom complet
            <input type="text" formControlName="name" placeholder="Jean Dupont" />
          </label>
          <label>
            Email
            <input type="email" formControlName="email" placeholder="votre@email.com" />
          </label>
          <label>
            Mot de passe
            <input type="password" formControlName="password" placeholder="••••••••" />
          </label>
          <button type="submit" [disabled]="submitting()">Créer mon compte</button>
          <p class="form-error" *ngIf="error()">{{ error() }}</p>
        </form>
        <p class="auth-footer">
          Déjà inscrit ? <a routerLink="/login">Connexion</a>
        </p>
      </section>
    </main>
  `,
  styles: [
    `
      .auth-shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #f8fafc;
        padding: 2rem;
      }
      .auth-panel {
        width: min(480px, 100%);
        background: white;
        border-radius: 1.5rem;
        box-shadow: 0 20px 80px rgba(15, 23, 42, 0.08);
        padding: 2.5rem;
        display: grid;
        gap: 1.25rem;
      }
      h1 {
        margin: 0;
        font-size: 2rem;
        color: #0f172a;
      }
      p {
        margin: 0;
        color: #475569;
      }
      form {
        display: grid;
        gap: 1rem;
      }
      label {
        display: grid;
        gap: 0.5rem;
        font-weight: 600;
        color: #334155;
      }
      input {
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
      button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
      .form-error {
        color: #b91c1c;
        font-size: 0.95rem;
      }
      .auth-footer {
        color: #475569;
      }
      .auth-footer a {
        color: #2563eb;
      }
    `,
  ],
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.authService.register(this.registerForm.value as { name: string; email: string; password: string }).subscribe({
      next: () => {
        this.router.navigate(['/booking']);
      },
      error: () => {
        this.error.set('Impossible de créer le compte. Vérifiez les informations saisies.');
        this.submitting.set(false);
      },
    });
  }
}
