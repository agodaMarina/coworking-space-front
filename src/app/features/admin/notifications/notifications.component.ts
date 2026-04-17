import { Component, computed, signal } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'promo' | 'system';
  target: 'all' | 'admins' | string;
  date: string;
  status: 'sent' | 'scheduled' | 'failed';
}

@Component({
  standalone: true,
  selector: 'app-admin-notifications',
  imports: [NgClass, DatePipe],
  templateUrl: './notifications.component.html',
})
export class AdminNotificationsComponent {
  readonly notifications = signal<AdminNotification[]>([
    { id: 1, title: 'Maintenance scheduled',   message: 'Open Space A will be closed Apr 20 for maintenance.', type: 'warning', target: 'all',    date: '2024-04-10', status: 'sent'      },
    { id: 2, title: 'New spaces available',     message: 'Two new private offices are now open for booking.',   type: 'info',    target: 'all',    date: '2024-04-12', status: 'sent'      },
    { id: 3, title: 'Spring promo — 20% off',   message: 'Book any space this April and get 20% off.',          type: 'promo',   target: 'all',    date: '2024-04-15', status: 'scheduled' },
    { id: 4, title: 'System update tonight',    message: 'The platform will be unavailable 2–3 AM.',            type: 'system',  target: 'admins', date: '2024-04-08', status: 'sent'      },
    { id: 5, title: 'Payment reminder',         message: 'Reminder: invoice INV-0002 is still pending.',        type: 'warning', target: 'Bob Johnson', date: '2024-04-14', status: 'failed' },
  ]);

  readonly stats = computed(() => ({
    sent:      this.notifications().filter(n => n.status === 'sent').length,
    scheduled: this.notifications().filter(n => n.status === 'scheduled').length,
    failed:    this.notifications().filter(n => n.status === 'failed').length,
  }));

  typeBadge(type: string): string {
    const map: Record<string, string> = {
      info:    'bg-[#AEE9F4] text-zinc-800',
      warning: 'bg-[#FDD5AB] text-zinc-800',
      promo:   'bg-[#CEF09D] text-zinc-800',
      system:  'bg-[#E2F89C] text-zinc-800',
    };
    return map[type] ?? 'bg-zinc-100 text-zinc-600';
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      sent:      'bg-[#CEF09D] text-zinc-800',
      scheduled: 'bg-[#FDD5AB] text-zinc-800',
      failed:    'bg-[#FBCBE3] text-zinc-800',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-600';
  }

  deleteNotification(id: number): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }
}
