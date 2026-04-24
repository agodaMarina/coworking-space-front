import { HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { finalize, map, Observable, of, tap } from 'rxjs';
import {
  ConfirmPaymentPayload,
  CreatePayment,
  CreatePaymentResponse,
  Payment,
  PaymentListParams,
  PaymentStats,
  RefundPaymentPayload
} from '../../dtos/payment';
import { PaginatedResponse } from '../../dtos/pagination';
import { ApiService } from '../../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService extends ApiService {
  private readonly useMocks = signal(true);
  readonly isLoading = signal(false);

  private mockPayments: Payment[] = [
    {
      id: 1,
      user_email: 'alice@example.com',
      reservation_info: { id: 11, space_name: 'Open Space A' },
      amount: 240,
      currency: 'FCFA',
      status: 'completed',
      status_display: 'Completed',
      method: 'card',
      method_display: 'Carte bancaire',
      transaction_id: 'TXN-0001',
      paid_at: '2026-04-10T08:00:00Z',
      created_at: '2026-04-10T07:55:00Z'
    },
    {
      id: 2,
      user_email: 'bob@example.com',
      reservation_info: { id: 12, space_name: 'Meeting Room 1' },
      amount: 120,
      currency: 'FCFA',
      status: 'pending',
      status_display: 'Pending',
      method: 'bank_transfer',
      method_display: 'Virement bancaire',
      transaction_id: null,
      paid_at: null,
      created_at: '2026-04-12T11:30:00Z'
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

  getPayments(params?: PaymentListParams): Observable<Payment[]> {
    return (this.useMocks()
      ? of(this.filterMockPayments(params))
      : this.get<PaginatedResponse<Payment>>('/payments/', this.buildParams(params)).pipe(
          map(response => response.results.map(payment => this.normalizePayment(payment)))
        )).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getPaymentsPage(params?: PaymentListParams): Observable<PaginatedResponse<Payment>> {
    return (this.useMocks()
      ? of(this.paginateMockPayments(this.filterMockPayments(params)))
      : this.get<PaginatedResponse<Payment>>('/payments/', this.buildParams(params)).pipe(
          map(response => ({
            ...response,
            results: response.results.map(payment => this.normalizePayment(payment))
          }))
        )).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getPayment(id: number): Observable<Payment> {
    const source = this.useMocks()
      ? of(this.mockPayments.find(payment => payment.id === id) ?? ({} as Payment))
      : this.get<Payment>(`/payments/${id}/`).pipe(
          map(payment => this.normalizePayment(payment))
        );

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  createPayment(payload: CreatePayment): Observable<CreatePaymentResponse> {
    const source = this.useMocks()
      ? of(this.createMockPayment(payload) as CreatePaymentResponse)
      : this.post<CreatePaymentResponse>('/payments/create/', payload).pipe(
          map(payment => ({ ...this.normalizePayment(payment), client_secret: payment.client_secret }))
        );

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  stripeConfirmPayment(id: number): Observable<Payment> {
    return this.post<Payment>(`/payments/${id}/stripe-confirm/`, {}).pipe(
      map(payment => this.normalizePayment(payment))
    );
  }

  confirmPayment(id: number, payload: ConfirmPaymentPayload): Observable<Payment> {
    const source = this.useMocks()
      ? of(this.confirmMockPayment(id, payload))
      : this.patch<Payment>(`/payments/${id}/confirm/`, payload).pipe(
          map(payment => this.normalizePayment(payment))
        );

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  refundPayment(id: number, payload: RefundPaymentPayload = {}): Observable<Payment | any> {
    const source = this.useMocks()
      ? of(this.refundMockPayment(id))
      : this.post<any>(`/payments/${id}/refund/`, payload);

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  downloadInvoice(id: number): Observable<string> {
    const source = this.useMocks()
      ? of("Facture simulée\nDate: 2026-04-22\nMontant: 15000 FCFA")
      : this.http.get(`${this.baseUrl}/payments/${id}/invoice/`, { responseType: 'text' });

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getPaymentStats(): Observable<PaymentStats> {
    return (this.useMocks()
      ? of(this.getMockStats())
      : this.get<PaymentStats>('/payments/stats/')).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }



  private buildParams(params?: PaymentListParams): HttpParams | undefined {
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

  private normalizePayment(payment: Payment): Payment {
    return {
      ...payment,
      amount: Number(payment.amount)
    };
  }

  private filterMockPayments(params?: PaymentListParams): Payment[] {
    return this.mockPayments.filter(payment => {
      if (params?.method && payment.method !== params.method) {
        return false;
      }

      if (params?.status && payment.status !== params.status) {
        return false;
      }

      return true;
    });
  }

  private paginateMockPayments(payments: Payment[]): PaginatedResponse<Payment> {
    return {
      count: payments.length,
      next: null,
      previous: null,
      results: payments
    };
  }

  private createMockPayment(payload: CreatePayment): Payment {
    const newPayment: Payment = {
      id: Math.max(0, ...this.mockPayments.map(payment => payment.id)) + 1,
      user_email: 'user@example.com',
      reservation_info: { id: payload.reservation_id },
      amount: 100,
      currency: 'FCFA',
      status: payload.method === 'cash' || payload.method === 'bank_transfer' ? 'pending' : 'completed',
      status_display: payload.method === 'cash' || payload.method === 'bank_transfer' ? 'Pending' : 'Completed',
      method: payload.method,
      method_display: payload.method,
      transaction_id: payload.method === 'cash' ? null : `TXN-${Date.now()}`,
      paid_at: payload.method === 'cash' || payload.method === 'bank_transfer' ? null : new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    this.mockPayments = [...this.mockPayments, newPayment];
    return newPayment;
  }

  private confirmMockPayment(id: number, payload: ConfirmPaymentPayload): Payment {
    const payment = this.mockPayments.find(item => item.id === id);

    if (!payment) {
      return {} as Payment;
    }

    payment.status = payload.status;
    payment.status_display = payload.status;
    payment.paid_at = payload.status === 'completed' ? new Date().toISOString() : payment.paid_at;
    return payment;
  }

  private refundMockPayment(id: number): Payment {
    const payment = this.mockPayments.find(item => item.id === id);

    if (!payment) {
      return {} as Payment;
    }

    payment.status = 'refunded';
    payment.status_display = 'Refunded';
    return payment;
  }

  private getMockStats(): PaymentStats {
    return {
      total_revenue: this.mockPayments
        .filter(payment => payment.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0),
      pending_count: this.mockPayments.filter(payment => payment.status === 'pending').length,
      refunded_count: this.mockPayments.filter(payment => payment.status === 'refunded').length
    };
  }
}
