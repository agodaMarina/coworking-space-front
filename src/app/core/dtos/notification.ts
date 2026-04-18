export type NotificationType =
  | 'reservation_confirmed'
  | 'reservation_cancelled'
  | 'reservation_reminder'
  | 'payment_completed'
  | 'payment_failed'
  | 'payment_refunded';

export type NotificationChannel = 'email' | 'sms' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface Notification {
  id: number;
  notification_type: NotificationType;
  type_display: string;
  channel: NotificationChannel;
  channel_display: string;
  status: NotificationStatus;
  status_display: string;
  message: string;
  sent_at: string | null;
  created_at: string;
}

export interface NotificationListParams {
  ordering?: string;
  page?: number;
  search?: string;
}

export type NotificationStats = Record<string, unknown>;
