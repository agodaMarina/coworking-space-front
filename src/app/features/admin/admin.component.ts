import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar/admin-sidebar.component';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-admin',
  providers:[MessageService],
  imports: [RouterOutlet, AdminSidebarComponent],
  template: `
    <div class="flex h-screen bg-white overflow-hidden">
      <app-admin-sidebar></app-admin-sidebar>
      <main class="flex-1 overflow-y-auto pt-12 md:pt-0">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AdminComponent {}
