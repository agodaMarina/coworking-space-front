export type PaymentMethod = 'card' | 'mobile_money' | 'cash' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentConfirmStatus = 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: number;
  user_email: string;
  reservation_info: Record<string, unknown>;
  amount: number;
  currency: string;
  status: PaymentStatus;
  status_display: string;
  method: PaymentMethod;
  method_display: string;
  transaction_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface CreatePayment {
  reservation_id: number;
  method: PaymentMethod;
}

export interface ConfirmPaymentPayload {
  status: PaymentConfirmStatus;
}

export interface PaymentListParams {
  method?: PaymentMethod;
  page?: number;
  status?: PaymentStatus;
}

export type PaymentStats = Record<string, unknown>;
