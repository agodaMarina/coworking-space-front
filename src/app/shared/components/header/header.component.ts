import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.setupMobileMenu();
  }

  setupMobileMenu() {
    setTimeout(() => {
      const menuBtn = document.getElementById('menuBtn');
      const menuClose = document.getElementById('menuClose');
      const mobileMenu = document.getElementById('mobileMenu');
      const menuLinks = document.querySelectorAll('.menu-link');

      if (menuBtn && menuClose && mobileMenu) {
        menuBtn.addEventListener('click', () => {
          mobileMenu.classList.add('open');
        });

        menuClose.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
        });

        menuLinks.forEach(link => {
          link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
          });
        });
      }
    }, 100);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}

