import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isAuthenticated:any;

  isMobileMenuOpen = false;

  toggleMenu() { this.isMobileMenuOpen = !this.isMobileMenuOpen; }
  closeMenu()  { this.isMobileMenuOpen = false; }

   ngOnInit(): void {
this.isAuthenticated = this.authService.isAuthenticated;
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
