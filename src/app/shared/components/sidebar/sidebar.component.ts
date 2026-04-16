import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.user;
  readonly mobileOpen = signal(false);

  readonly userInitials = computed(() => {
    const name = this.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  });

  readonly navItems = [
    { label: 'Overview',    icon: 'lucide:layout-dashboard', path: 'overview' },
    { label: 'My Bookings', icon: 'lucide:calendar',         path: 'bookings' },
    { label: 'Spaces',      icon: 'lucide:grid-2x2',         path: 'spaces' },
    { label: 'Profile',     icon: 'lucide:user',             path: 'profile' },
  ];

  readonly bottomItems = [
    { label: 'Browse public', icon: 'lucide:arrow-up-right', path: '/spaces' },
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
