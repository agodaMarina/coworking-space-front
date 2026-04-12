import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-footer',
  template: `
    <footer class="footer-shell">
      <p>© 2026 Cowork. Tous droits réservés.</p>
    </footer>
  `,
  styles: [
    `
      .footer-shell {
        width: 100%;
        padding: 1.5rem;
        text-align: center;
        color: #64748b;
        font-size: 0.9rem;
        background: #f8fafc;
        border-top: 1px solid rgba(15, 23, 42, 0.08);
      }
    `,
  ]
})
export class FooterComponent {}
