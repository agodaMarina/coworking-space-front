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
    { label: 'Aperçu',        icon: 'lucide:layout-dashboard', path: '/admin/overview',     activeClass: 'bg-[#AEE9F4] text-zinc-900 font-medium' },
    { label: 'Salles',        icon: 'lucide:building-2',       path: '/admin/rooms',        activeClass: 'bg-[#FBCBE3] text-zinc-900 font-medium' },
    { label: 'Réservations',  icon: 'lucide:calendar-range',   path: '/admin/reservations', activeClass: 'bg-[#FDD5AB] text-zinc-900 font-medium' },
    { label: 'Équipements',   icon: 'lucide:package',          path: '/admin/equipment',    activeClass: 'bg-[#E2F89C] text-zinc-900 font-medium' },
    { label: 'Utilisateurs',  icon: 'lucide:users',            path: '/admin/users',        activeClass: 'bg-[#CEF09D] text-zinc-900 font-medium' },
    // Paiements et notifications réactivés lors de l'intégration paiement
    // { label: 'Paiements',     icon: 'lucide:credit-card',      path: '/admin/payments',     activeClass: 'bg-[#E2F89C] text-zinc-900 font-medium' },
    // { label: 'Notifications', icon: 'lucide:bell',             path: '/admin/notifications',activeClass: 'bg-[#CEF09D] text-zinc-900 font-medium' },
    { label: 'Profil',        icon: 'lucide:user',             path: '/admin/profile',      activeClass: 'bg-[#FBCBE3] text-zinc-900 font-medium' },
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
