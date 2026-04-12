import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Password } from 'primeng/password';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Button, Password],
  template: `
    <main class="auth-shell">
      <section class="auth-panel">
        <h1>Créer un compte</h1>
        <p>Inscrivez-vous et commencez à réserver des espaces en quelques clics.</p>
        <form [formGroup]="registerForm" (ngSubmit)="submit()">
          <div class="form-group">
            <label>Nom complet</label>
            <p-inputText type="text" formControlName="name" placeholder="Jean Dupont" class="w-full" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <p-inputText type="email" formControlName="email" placeholder="votre@email.com" class="w-full" />
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <p-password
              formControlName="password"
              placeholder="••••••••"
              [toggleMask]="true"
              styleClass="w-full">
            </p-password>
          </div>
          <p-button type="submit" label="Créer mon compte" [loading]="submitting()" styleClass="w-full" />
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
      .form-group {
        display: grid;
        gap: 0.5rem;
      }
      label {
        font-weight: 600;
        color: #334155;
      }
      .w-full {
        width: 100%;
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
