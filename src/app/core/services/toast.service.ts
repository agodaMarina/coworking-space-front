import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private messageService: MessageService) {}

  showSuccess(message: string, duration = 3000): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: message,
      life: duration,
    });
  }

  showError(message: string, duration = 5000): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
      life: duration,
    });
  }

  showWarning(message: string, duration = 4000): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Avertissement',
      detail: message,
      life: duration,
    });
  }

  showInfo(message: string, duration = 3000): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Information',
      detail: message,
      life: duration,
    });
  }

  clear(): void {
    this.messageService.clear();
  }
}
