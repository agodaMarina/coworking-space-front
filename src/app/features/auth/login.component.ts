import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Password } from 'primeng/password';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Button, Password],
  template: `
    <main class="auth-shell">
      <section class="auth-panel">
        <h1>Connexion</h1>
        <p>Accédez à votre espace client pour réserver un espace ou une salle.</p>
        <form [formGroup]="loginForm" (ngSubmit)="submit()">
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
          <p-button type="submit" label="Se connecter" [loading]="submitting()" styleClass="w-full" />
          <p class="form-error" *ngIf="error()">{{ error() }}</p>
        </form>
        <p class="auth-footer">
          Pas encore de compte ? <a routerLink="/register">Créer un compte</a>
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
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.authService.login(this.loginForm.value as { email: string; password: string }).subscribe({
      next: () => {
        this.router.navigate(['/booking']);
      },
      error: () => {
        this.error.set('Impossible de se connecter. Vérifiez vos identifiants.');
        this.submitting.set(false);
      },
    });
  }
}
