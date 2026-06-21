import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  readonly user       = this.authService.user;
  readonly mobileOpen = signal(false);

  readonly userInitials = computed(() => {
    const name = this.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  });

  readonly navItems = [
    { label: 'Aperçu',           icon: 'lucide:layout-dashboard', path: '/dashboard/overview', activeClass: 'bg-[#AEE9F4] text-zinc-900 font-medium' },
    { label: 'Mes réservations', icon: 'lucide:calendar',         path: '/dashboard/bookings', activeClass: 'bg-[#CEF09D] text-zinc-900 font-medium' },
    // Paiements et notifications réactivés lors de l'intégration paiement
    // { label: 'Paiements',        icon: 'lucide:credit-card',      path: '/dashboard/payments',       activeClass: 'bg-[#FDD5AB] text-zinc-900 font-medium' },
    // { label: 'Notifications',    icon: 'lucide:bell',             path: '/dashboard/notifications',  activeClass: 'bg-[#FBCBE3] text-zinc-900 font-medium' },
    { label: 'Profil',           icon: 'lucide:user',             path: '/dashboard/profile',  activeClass: 'bg-[#FBCBE3] text-zinc-900 font-medium' },
  ];

  readonly bottomItems = [
    { label: 'Parcourir les salles', icon: 'lucide:arrow-up-right', path: '/rooms' },
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
