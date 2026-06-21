import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterPageComponent {
  private readonly authService  = inject(AuthService);
  private readonly router       = inject(Router);
  private readonly fb           = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  readonly submitting   = signal(false);
  readonly error        = signal<string | null>(null);
  readonly showPassword = signal(false);

  // L'API Flask attend uniquement : name, email, password
  readonly registerForm = this.fb.group({
    name:     ['', [Validators.required, Validators.minLength(2)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const { name, email, password } = this.registerForm.value as { name: string; email: string; password: string };

    this.authService.register({ name, email, password }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toastService.showSuccess('Compte créé avec succès. Connectez-vous pour continuer.');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.submitting.set(false);
        // Le message d'erreur précis est géré par l'intercepteur
        this.error.set('Impossible de créer le compte. Vérifiez vos informations.');
      },
    });
  }
}
