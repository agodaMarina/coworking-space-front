import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [ToastModule],
  template: `<p-toast position="top-right"></p-toast>`,
  providers: [MessageService]
})
export class ToastContainerComponent {}


