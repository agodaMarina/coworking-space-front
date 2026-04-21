import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly registerForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    password_confirm: ['', Validators.required],
  });

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.authService.register(this.registerForm.value as any).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.toastService.showSuccess('Compte créé avec succès.');
        const role = response.user?.role;
        this.router.navigate([role === 'admin' ? '/admin/overview' : '/dashboard/overview']);
      },
      error: (err) => {
        this.submitting.set(false);
        const apiErrors = err?.error;
        let message = 'Impossible de créer le compte. Vérifiez vos informations.';
        if (apiErrors && typeof apiErrors === 'object') {
          message = Object.values(apiErrors).flat().join(' ');
        }
        this.error.set(message);
        this.toastService.showError(message);
      },
    });
  }
}
