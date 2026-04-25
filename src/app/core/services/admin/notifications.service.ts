import { HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { finalize, interval, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { Notification, NotificationListParams, NotificationStats } from '../../dtos/notification';
import { PaginatedResponse } from '../../dtos/pagination';
import { ApiService } from '../../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService extends ApiService {
  private readonly useMocks    = signal(true);
  readonly isLoading           = signal(false);
  private readonly _unreadCount = signal(0);
  readonly unreadCount          = this._unreadCount.asReadonly();
  readonly recentNotifications  = signal<Notification[]>([]);

  decrementUnreadCount(): void {
    this._unreadCount.update(c => Math.max(0, c - 1));
  }

  resetUnreadCount(): void {
    this._unreadCount.set(0);
  }

  private mockNotifications: Notification[] = [
    {
      id: 1,
      notification_type: 'reservation_confirmed',
      type_display: 'Reservation confirmed',
      channel: 'in_app',
      channel_display: 'In app',
      status: 'sent',
      status_display: 'Sent',
      message: 'Your reservation has been confirmed.',
      sent_at: '2026-04-16T10:00:00Z',
      created_at: '2026-04-16T09:55:00Z'
    },
    {
      id: 2,
      notification_type: 'payment_completed',
      type_display: 'Payment completed',
      channel: 'email',
      channel_display: 'Email',
      status: 'pending',
      status_display: 'Pending',
      message: 'Invoice INV-0002 is waiting for confirmation.',
      sent_at: null,
      created_at: '2026-04-17T14:20:00Z'
    }
  ];

  enableMocks(): void {
    this.useMocks.set(true);
  }

  disableMocks(): void {
    this.useMocks.set(false);
  }

  toggleMocks(): void {
    this.useMocks.set(!this.useMocks());
  }

  getNotifications(params?: NotificationListParams): Observable<Notification[]> {
    return (this.useMocks()
      ? of(this.filterMockNotifications(params))
      : this.get<PaginatedResponse<Notification>>('/notifications/', this.buildParams(params)).pipe(
          map(response => response.results)
        )).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getNotificationsPage(params?: NotificationListParams): Observable<PaginatedResponse<Notification>> {
    return (this.useMocks()
      ? of(this.paginateMockNotifications(this.filterMockNotifications(params)))
      : this.get<PaginatedResponse<Notification>>('/notifications/', this.buildParams(params))).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getAllNotifications(params?: NotificationListParams): Observable<Notification[]> {
    return (this.useMocks()
      ? of(this.filterMockNotifications(params))
      : this.get<PaginatedResponse<Notification>>('/notifications/all/', this.buildParams(params)).pipe(
          map(response => response.results)
        )).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getAllNotificationsPage(params?: NotificationListParams): Observable<PaginatedResponse<Notification>> {
    return (this.useMocks()
      ? of(this.paginateMockNotifications(this.filterMockNotifications(params)))
      : this.get<PaginatedResponse<Notification>>('/notifications/all/', this.buildParams(params))).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  markAsRead(id: number): Observable<void> {
    const source = this.useMocks()
      ? of(this.markMockAsRead(id))
      : this.patch<void>(`/notifications/${id}/read/`, {});

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  markAllAsRead(): Observable<void> {
    const source = this.useMocks()
      ? of(this.markAllMockAsRead())
      : this.post<void>('/notifications/read/', {});

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getStats(): Observable<NotificationStats> {
    return (this.useMocks()
      ? of(this.getMockStats())
      : this.get<NotificationStats>('/notifications/stats/')).pipe(
      tap((stats: any) => this._unreadCount.set(stats.unread ?? 0)),
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  startPolling(): void {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.getStats()),
    ).subscribe();

    // Charger les notifications récentes au démarrage
    this.getNotifications().subscribe(notifs => this.recentNotifications.set(notifs.slice(0, 10)));
  }

  private buildParams(params?: NotificationListParams): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return httpParams.keys().length ? httpParams : undefined;
  }

  private filterMockNotifications(params?: NotificationListParams): Notification[] {
    return this.mockNotifications.filter(notification => {
      if (params?.search) {
        const query = params.search.toLowerCase();
        const haystack = `${notification.message} ${notification.type_display}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  private paginateMockNotifications(notifications: Notification[]): PaginatedResponse<Notification> {
    return {
      count: notifications.length,
      next: null,
      previous: null,
      results: notifications
    };
  }

  private markMockAsRead(id: number): void {
    this.mockNotifications = this.mockNotifications.map(notification =>
      notification.id === id
        ? {
            ...notification,
            status: 'sent',
            status_display: 'Sent',
            sent_at: notification.sent_at ?? new Date().toISOString()
          }
        : notification
    );
  }

  private markAllMockAsRead(): void {
    this.mockNotifications = this.mockNotifications.map(notification => ({
      ...notification,
      status: 'sent',
      status_display: 'Sent',
      sent_at: notification.sent_at ?? new Date().toISOString()
    }));
  }

  private getMockStats(): NotificationStats {
    return {
      total: this.mockNotifications.length,
      unread: this.mockNotifications.filter(notification => notification.status !== 'sent').length
    };
  }
}
