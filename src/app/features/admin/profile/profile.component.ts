import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputComponent } from '../../../shared/components/input/input.component';
import { MessageService } from 'primeng/api';

const PASTEL_COLORS = ['bg-[#AEE9F4]', 'bg-[#CEF09D]', 'bg-[#FBCBE3]', 'bg-[#FDD5AB]', 'bg-[#E2F89C]'];

@Component({
  standalone: true,
  selector: 'app-admin-profile',
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './profile.component.html',
  providers: [MessageService]
})
export class AdminProfileComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb    = inject(FormBuilder);

  ngOnInit(): void {
  }

  readonly user = this.auth.user;

  readonly userInitials = computed(() => {
    const name = this.user()?.full_name ?? `${this.user()?.first_name ?? ''} ${this.user()?.last_name ?? ''}`.trim();
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A';
  });

  readonly avatarColor = computed(() => {
    const id = Number(this.user()?.id ?? 0);
    return PASTEL_COLORS[id % PASTEL_COLORS.length] || PASTEL_COLORS[0];
  });

  readonly infoForm: FormGroup = this.fb.group({
    name:  [this.user()?.full_name ?? `${this.user()?.first_name ?? ''} ${this.user()?.last_name ?? ''}`.trim(),  Validators.required],
    email: [this.user()?.email ?? '', [Validators.required, Validators.email]],
  });

  readonly passwordForm: FormGroup = this.fb.group({
    current:  ['', Validators.required],
    next:     ['', [Validators.required, Validators.minLength(8)]],
    confirm:  ['', Validators.required],
  });

  readonly savingInfo     = signal(false);
  readonly savingPassword = signal(false);

  readonly passwordMismatch = computed(() => {
    const f = this.passwordForm.value;
    return f.next && f.confirm && f.next !== f.confirm;
  });

  saveInfo(): void {
    if (this.infoForm.invalid) return;
    this.savingInfo.set(true);
    const v = this.infoForm.value;
    const names = (v.name || '').trim().split(' ');
    const firstName = names[0] || '';
    const lastName  = names.slice(1).join(' ') || '';
    this.auth.updateProfile({ first_name: firstName, last_name: lastName }).subscribe({
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
    const v = this.passwordForm.value;
    this.auth.changePassword({
      old_password: v.current,
      new_password: v.next,
      new_password_confirm: v.confirm,
    }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.toast.showSuccess('Mot de passe modifié avec succès.');
      },
      error: () => {
        this.savingPassword.set(false);
        this.toast.showError('Impossible de modifier le mot de passe.');
      },
    });
  }
}
