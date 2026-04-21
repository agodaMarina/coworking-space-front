import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

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
    const name = this.user()?.full_name ?? `${this.user()?.first_name ?? ''} ${this.user()?.last_name ?? ''}`.trim();
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  });

  readonly navItems = [
    { label: 'Overview',    icon: 'lucide:layout-dashboard', path: '/dashboard/overview',  activeClass: 'bg-[#AEE9F4] text-zinc-900 font-medium' },
    { label: 'My Bookings', icon: 'lucide:calendar',         path: '/dashboard/bookings',  activeClass: 'bg-[#CEF09D] text-zinc-900 font-medium' },
    { label: 'Payments',    icon: 'lucide:credit-card',      path: '/dashboard/payments',  activeClass: 'bg-[#FDD5AB] text-zinc-900 font-medium' },
    { label: 'Spaces',      icon: 'lucide:grid-2x2',         path: '/dashboard/spaces',    activeClass: 'bg-[#E2F89C] text-zinc-900 font-medium' },
    { label: 'Profile',     icon: 'lucide:user',             path: '/dashboard/profile',   activeClass: 'bg-[#FBCBE3] text-zinc-900 font-medium' },
  ];

  readonly bottomItems = [
    { label: 'Browse public', icon: 'lucide:arrow-up-right', path: '/spaces' },
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
