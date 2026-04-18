import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/dtos/auth';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly user = signal<User | null>(this.authService.user());

  ngOnInit(): void {
    this.loadProfile();
  }


  readonly userInitials = computed(() => {
    const name = this.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  });

  loadProfile(): void {
    this.authService.loadProfile().subscribe({
      next: (user) => {
        this.user.set(user);
      },
      error: (err) => {
        this.toastService.showError('Impossible de charger le profile');
        console.error('Impossible de charger le profile', err);
      }
    });
  }


}
