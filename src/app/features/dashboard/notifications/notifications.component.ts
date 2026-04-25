import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { NotificationsService } from '../../../core/services/admin/notifications.service';
import { Notification } from '../../../core/dtos/notification';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-dashboard-notifications',
  imports: [NgClass, DatePipe, PaginationComponent],
  templateUrl: './notifications.component.html',
  providers: [MessageService],
})
export class DashboardNotificationsComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  private readonly toast = inject(ToastService);

  readonly notifications = signal<Notification[]>([]);
  readonly unreadCount   = this.notificationsService.unreadCount;
  readonly page          = signal(1);
  readonly pageSize      = 10;
  readonly markingAll    = signal(false);

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.notifications().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.notificationsService.disableMocks();
    this.loadNotifications();
    this.loadStats();
  }

  loadNotifications(): void {
    this.notificationsService.getNotifications().subscribe({
      next: list => this.notifications.set(list),
      error: () => this.toast.showError('Unable to load notifications.'),
    });
  }

  loadStats(): void {
    this.notificationsService.getStats().subscribe();
  }

  markAsRead(n: Notification): void {
    if (n.status === 'sent') return;
    this.notificationsService.markAsRead(n.id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(item => item.id === n.id ? { ...item, status: 'sent' as const, status_display: 'Sent' } : item)
        );
        this.notificationsService.decrementUnreadCount();
      },
    });
  }

  markAllAsRead(): void {
    this.markingAll.set(true);
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(item => ({ ...item, status: 'sent' as const, status_display: 'Sent', sent_at: item.sent_at ?? new Date().toISOString() }))
        );
        this.notificationsService.resetUnreadCount();
        this.markingAll.set(false);
        this.toast.showSuccess('All notifications marked as read.');
      },
      error: () => {
        this.markingAll.set(false);
        this.toast.showError('Unable to mark all as read.');
      },
    });
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      reservation_confirmed: 'lucide:calendar-check',
      reservation_cancelled: 'lucide:calendar-x',
      reservation_reminder:  'lucide:bell-ring',
      payment_completed:     'lucide:check-circle',
      payment_failed:        'lucide:x-circle',
      payment_refunded:      'lucide:rotate-ccw',
    };
    return map[type] ?? 'lucide:bell';
  }

  typeBg(type: string): string {
    const map: Record<string, string> = {
      reservation_confirmed: 'bg-[#CEF09D]',
      reservation_cancelled: 'bg-[#FBCBE3]',
      reservation_reminder:  'bg-[#FDD5AB]',
      payment_completed:     'bg-[#CEF09D]',
      payment_failed:        'bg-[#FBCBE3]',
      payment_refunded:      'bg-[#AEE9F4]',
    };
    return map[type] ?? 'bg-zinc-100';
  }
}
