import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  providers: [MessageService],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('coworking-front');
}
