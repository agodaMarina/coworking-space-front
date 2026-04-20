
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/dtos/auth';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputComponent } from '../../../shared/components/input/input.component';
import { MessageService } from 'primeng/api';

const PASTEL_COLORS = ['bg-[#AEE9F4]', 'bg-[#CEF09D]', 'bg-[#FBCBE3]', 'bg-[#FDD5AB]', 'bg-[#E2F89C]'];

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './profile.component.html',
  providers:[MessageService]
})

export class ProfileComponent {
  private readonly auth  = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb    = inject(FormBuilder);


  ngOnInit(): void {

  }

  readonly user = this.auth.user;

  readonly userInitials = computed(() => {
    const name = this.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  });

  // loadProfile(): void {
  //   this.authService.loadProfile().subscribe({
  //     next: (user) => {
  //       this.user.set(user);
  //     },
  //     error: (err) => {
  //       this.toastService.showError('Impossible de charger le profile');
  //       console.error('Impossible de charger le profile', err);
  //     }
  //   });
  // }



  readonly avatarColor = computed(() => {
    const id = Number(this.user()?.id ?? 0);
    return PASTEL_COLORS[id % PASTEL_COLORS.length];
  });

  readonly infoForm: FormGroup = this.fb.group({
    name:  [this.user()?.name ?? '',  Validators.required],
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
    // Simulate async save — replace with real API call
    setTimeout(() => {
      this.savingInfo.set(false);
      this.toast.showSuccess('Profile updated.');
    }, 600);
  }

  savePassword(): void {
    if (this.passwordForm.invalid || this.passwordMismatch()) return;
    this.savingPassword.set(true);
    setTimeout(() => {
      this.savingPassword.set(false);
      this.passwordForm.reset();
      this.toast.showSuccess('Password changed successfully.');
    }, 600);
  }
}
