import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

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
      next: (response) => {
        this.submitting.set(false);
        this.toastService.showSuccess('Connexion réussie.');
        const role = response.user?.role;
        this.router.navigate([role === 'admin' ? '/admin/overview' : '/dashboard/overview']);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.detail ?? err?.error?.non_field_errors?.[0] ?? 'Identifiants invalides. Veuillez vérifier votre email et mot de passe.';
        this.toastService.showError(msg);
        this.error.set(msg);
      },
    });
  }
}
