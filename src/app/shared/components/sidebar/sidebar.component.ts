import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationsService } from '../../../core/services/admin/notifications.service';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgClass, DatePipe],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  private readonly authService          = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly router               = inject(Router);

  readonly unreadCount        = this.notificationsService.unreadCount;
  readonly recentNotifications = this.notificationsService.recentNotifications;
  readonly user               = this.authService.user;
  readonly mobileOpen         = signal(false);
  readonly showBell           = signal(false);

  readonly userInitials = computed(() => {
    const name = this.user()?.full_name ?? `${this.user()?.first_name ?? ''} ${this.user()?.last_name ?? ''}`.trim();
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  });

  ngOnInit(): void {
    if (this.user()) {
      this.notificationsService.disableMocks();
      this.notificationsService.startPolling();
    }
  }

  toggleBell(): void  { this.showBell.update(v => !v); }
  closeBell(): void   { this.showBell.set(false); }

  markAllRead(): void {
    this.notificationsService.markAllAsRead().subscribe(() => {
      this.notificationsService.resetUnreadCount();
    });
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      reservation_received:  'lucide:calendar-plus',
      reservation_request:   'lucide:calendar-clock',
      reservation_confirmed: 'lucide:calendar-check',
      reservation_rejected:  'lucide:calendar-x',
      reservation_cancelled: 'lucide:calendar-x',
      reservation_reminder:  'lucide:bell-ring',
      payment_completed:     'lucide:check-circle',
      payment_received:      'lucide:circle-dollar-sign',
      payment_failed:        'lucide:x-circle',
      payment_refunded:      'lucide:rotate-ccw',
    };
    return map[type] ?? 'lucide:bell';
  }

  typeBg(type: string): string {
    const map: Record<string, string> = {
      reservation_received:  'bg-[#AEE9F4]',
      reservation_request:   'bg-[#FDD5AB]',
      reservation_confirmed: 'bg-[#CEF09D]',
      reservation_rejected:  'bg-[#FBCBE3]',
      reservation_cancelled: 'bg-[#FBCBE3]',
      reservation_reminder:  'bg-[#FDD5AB]',
      payment_completed:     'bg-[#CEF09D]',
      payment_received:      'bg-[#AEE9F4]',
      payment_failed:        'bg-[#FBCBE3]',
      payment_refunded:      'bg-[#AEE9F4]',
    };
    return map[type] ?? 'bg-zinc-100';
  }

  readonly navItems = [
    { label: 'Aperçu',    icon: 'lucide:layout-dashboard', path: '/dashboard/overview',  activeClass: 'bg-[#AEE9F4] text-zinc-900 font-medium' },
    { label: 'Mes réservations', icon: 'lucide:calendar',         path: '/dashboard/bookings',  activeClass: 'bg-[#CEF09D] text-zinc-900 font-medium' },
    { label: 'Paiements',    icon: 'lucide:credit-card',      path: '/dashboard/payments',       activeClass: 'bg-[#FDD5AB] text-zinc-900 font-medium' },
    { label: 'Notifications', icon: 'lucide:bell',            path: '/dashboard/notifications',  activeClass: 'bg-[#FBCBE3] text-zinc-900 font-medium' },
    { label: 'Espaces',      icon: 'lucide:grid-2x2',         path: '/dashboard/spaces',         activeClass: 'bg-[#E2F89C] text-zinc-900 font-medium' },
    { label: 'Profil',     icon: 'lucide:user',             path: '/dashboard/profile',   activeClass: 'bg-[#FBCBE3] text-zinc-900 font-medium' },
  ];

  readonly bottomItems = [
    { label: 'Parcourir les espaces', icon: 'lucide:arrow-up-right', path: '/spaces' },
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
