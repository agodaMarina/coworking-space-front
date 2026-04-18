import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
})
export class AdminSidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.user;
  readonly mobileOpen = signal(false);

  readonly userInitials = computed(() => {
    const name = this.user()?.name ?? '';
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'A';
  });

  readonly navItems = [
    { label: 'Overview',      icon: 'lucide:layout-dashboard', path: 'overview',      activeClass: 'bg-[#AEE9F4] text-zinc-900 font-medium' },
    { label: 'Users',         icon: 'lucide:users',            path: 'users',         activeClass: 'bg-[#CEF09D] text-zinc-900 font-medium' },
    { label: 'Reservations',  icon: 'lucide:calendar-range',   path: 'reservations',  activeClass: 'bg-[#FDD5AB] text-zinc-900 font-medium' },
    { label: 'Spaces',        icon: 'lucide:building-2',       path: 'spaces',        activeClass: 'bg-[#FBCBE3] text-zinc-900 font-medium' },
    { label: 'Payments',      icon: 'lucide:credit-card',      path: 'payments',      activeClass: 'bg-[#E2F89C] text-zinc-900 font-medium' },
    { label: 'Equipment',     icon: 'lucide:package',          path: 'equipment',     activeClass: 'bg-[#AEE9F4] text-zinc-900 font-medium' },
    { label: 'Notifications', icon: 'lucide:bell',             path: 'notifications', activeClass: 'bg-[#CEF09D] text-zinc-900 font-medium' },
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
