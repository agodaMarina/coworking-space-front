import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers:[MessageService]
})
export class DashboardComponent {}
