import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationsService } from '../../../core/services/admin/notifications.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {

  private readonly authService   = inject(AuthService);
  private readonly router        = inject(Router);
  readonly notifService          = inject(NotificationsService);

  isAuthenticated: any;
  isMobileMenuOpen   = false;
  showNotifPanel     = signal(false);

  toggleMenu()  { this.isMobileMenuOpen = !this.isMobileMenuOpen; }
  closeMenu()   { this.isMobileMenuOpen = false; }

  toggleNotifications(): void {
    this.showNotifPanel.update(v => !v);
  }

  markAllRead(): void {
    this.notifService.markAllAsRead().subscribe();
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated;
    this.notifService.disableMocks();
    this.notifService.startPolling();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
