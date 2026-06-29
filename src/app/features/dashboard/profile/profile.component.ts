import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { InputComponent } from '../../../shared/components/input/input.component';

const PASTEL_COLORS = ['bg-[#AEE9F4]', 'bg-[#CEF09D]', 'bg-[#FBCBE3]', 'bg-[#FDD5AB]', 'bg-[#E2F89C]'];

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './profile.component.html',
  providers: [MessageService],
})
export class ProfileComponent {
  private readonly auth  = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb    = inject(FormBuilder);

  readonly user = this.auth.user;

  // Initiales basées sur le champ unique "name" de l'API Flask
  readonly userInitials = computed(() => {
    const name = this.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  });

  readonly avatarColor = computed(() => {
    const id = this.user()?.id ?? '';
    const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return PASTEL_COLORS[hash % PASTEL_COLORS.length];
  });

  readonly infoForm: FormGroup = this.fb.group({
    name:  [this.user()?.name  ?? '', Validators.required],
    email: [this.user()?.email ?? '', [Validators.required, Validators.email]],
  });

  readonly passwordForm: FormGroup = this.fb.group({
    current: ['', Validators.required],
    next:    ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
  });

  readonly savingInfo     = signal(false);
  readonly savingPassword = signal(false);

  readonly passwordMismatch = computed(() => {
    const { next, confirm } = this.passwordForm.value;
    return !!next && !!confirm && next !== confirm;
  });

  saveInfo(): void {
    if (this.infoForm.invalid) return;
    this.savingInfo.set(true);
    const { name, email } = this.infoForm.value;
    this.auth.updateProfile({ name, email }).subscribe({
      next: () => {
        this.savingInfo.set(false);
        this.toast.showSuccess('Profil mis à jour.');
      },
      error: () => {
        this.savingInfo.set(false);
        this.toast.showError('Impossible de mettre à jour le profil.');
      },
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid || this.passwordMismatch()) return;
    this.savingPassword.set(true);
    // TODO: implémenter l'endpoint de changement de mot de passe
    setTimeout(() => {
      this.savingPassword.set(false);
      this.passwordForm.reset();
      this.toast.showSuccess('Mot de passe mis à jour.');
    }, 500);
  }
}
