import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isAuthenticated = this.authService.isAuthenticated;
  isMobileMenuOpen = false;

  toggleMenu() { this.isMobileMenuOpen = !this.isMobileMenuOpen; }
  closeMenu()  { this.isMobileMenuOpen = false; }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
