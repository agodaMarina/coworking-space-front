import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
  format: string; // ex: "## ### ## ##"
}

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
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
  readonly phoneDropdownOpen = signal(false);

  readonly countries: Country[] = [
    { code: 'SN', name: 'Sénégal',       dial: '+221', flag: '🇸🇳', format: '## ### ## ##' },
    { code: 'CI', name: "Côte d'Ivoire", dial: '+225', flag: '🇨🇮', format: '## ## ## ## ##' },
    { code: 'ML', name: 'Mali',          dial: '+223', flag: '🇲🇱', format: '## ## ## ##' },
    { code: 'GN', name: 'Guinée',        dial: '+224', flag: '🇬🇳', format: '### ## ## ##' },
    { code: 'BF', name: 'Burkina Faso',  dial: '+226', flag: '🇧🇫', format: '## ## ## ##' },
    { code: 'NE', name: 'Niger',         dial: '+227', flag: '🇳🇪', format: '## ## ## ##' },
    { code: 'TG', name: 'Togo',          dial: '+228', flag: '🇹🇬', format: '## ## ## ##' },
    { code: 'BJ', name: 'Bénin',         dial: '+229', flag: '🇧🇯', format: '## ## ## ##' },
    { code: 'CM', name: 'Cameroun',      dial: '+237', flag: '🇨🇲', format: '# ## ## ## ##' },
    { code: 'FR', name: 'France',        dial: '+33',  flag: '🇫🇷', format: '# ## ## ## ##' },
  ];

  selectedCountry = signal<Country>(this.countries[0]);

  readonly registerForm = this.fb.group({
    first_name:       ['', Validators.required],
    last_name:        ['', Validators.required],
    username:         ['', Validators.required],
    email:            ['', [Validators.required, Validators.email]],
    phone:            ['', Validators.required],
    password:         ['', Validators.required],
    password_confirm: ['', Validators.required],
  });

  selectCountry(country: Country): void {
    this.selectedCountry.set(country);
    this.phoneDropdownOpen.set(false);
    // reset + reformat with new placeholder
    this.registerForm.get('phone')?.setValue('');
  }

  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    const fmt = this.selectedCountry().format;
    let result = '';
    let di = 0;
    for (let i = 0; i < fmt.length && di < digits.length; i++) {
      if (fmt[i] === '#') {
        result += digits[di++];
      } else {
        result += fmt[i];
      }
    }
    input.value = result;
    this.registerForm.get('phone')?.setValue(result, { emitEvent: false });
  }

  get phonePlaceholder(): string {
    return this.selectedCountry().format.replace(/#/g, '0');
  }

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const raw = this.registerForm.value;
    const phone = `${this.selectedCountry().dial}${raw.phone?.replace(/\s/g, '')}`;

    this.submitting.set(true);
    this.error.set(null);

    this.authService.register({ ...raw, phone } as any).subscribe({
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
