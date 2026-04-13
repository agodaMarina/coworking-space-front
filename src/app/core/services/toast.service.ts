import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  readonly toastList = this.toasts.asReadonly();

  showSuccess(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  showError(message: string, duration = 5000): void {
    this.show(message, 'error', duration);
  }

  showWarning(message: string, duration = 4000): void {
    this.show(message, 'warning', duration);
  }

  showInfo(message: string, duration = 3000): void {
    this.show(message, 'info', duration);
  }

  private show(message: string, severity: Toast['severity'], duration: number): void {
    const id = `toast-${Date.now()}`;
    const toast: Toast = { id, message, severity, duration };

    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
