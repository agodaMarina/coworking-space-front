import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  // Variable d'état pour le menu mobile
  isMobileMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  // Méthode pour ouvrir/fermer le menu
  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Méthode pour fermer le menu quand on clique sur un lien
  closeMenu() {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}