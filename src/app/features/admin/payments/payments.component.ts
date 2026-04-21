import { Component, computed, OnInit, signal } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { ToastService } from '../../../core/services/toast.service';
import { PaymentsService } from '../../../core/services/admin/payments.service';
import { Payment as ApiPayment } from '../../../core/dtos/payment';
import { MessageService } from 'primeng/api';

export interface AdminPayment {
  id: number;
  invoice: string;
  user: string;
  space: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded';
}

type StatusAction = { id: number; target: 'paid' | 'refunded' };

const PAGE_SIZE = 8;

@Component({
  standalone: true,
  selector: 'app-admin-payments',
  imports: [NgClass, CurrencyPipe, DatePipe, PaginationComponent, ConfirmDialogComponent, TableComponent, ColumnComponent],
  templateUrl: './payments.component.html',
  providers: [MessageService]
})
export class AdminPaymentsComponent implements OnInit {
  readonly activeFilter = signal<'all' | 'paid' | 'pending' | 'refunded'>('all');
  readonly page         = signal(1);
  readonly pageSize     = PAGE_SIZE;
  readonly pendingAction = signal<StatusAction | null>(null);

  readonly filters = [
    { key: 'all' as const,      label: 'All'      },
    { key: 'paid' as const,     label: 'Paid'     },
    { key: 'pending' as const,  label: 'Pending'  },
    { key: 'refunded' as const, label: 'Refunded' },
  ];

  readonly payments = signal<AdminPayment[]>([]);

  readonly allFiltered = computed(() => {
    const f = this.activeFilter();
    return f === 'all' ? this.payments() : this.payments().filter(p => p.status === f);
  });

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.allFiltered().slice(start, start + PAGE_SIZE);
  });

  readonly stats = computed(() => ({
    total:    this.payments().reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0),
    pending:  this.payments().filter(p => p.status === 'pending').length,
    refunded: this.payments().filter(p => p.status === 'refunded').length,
  }));

  constructor(
    private toast: ToastService,
    private paymentsService: PaymentsService
  ) {}

  ngOnInit(): void {
    this.paymentsService.disableMocks();
    this.loadPayments();
  }

  private loadPayments(): void {
    this.paymentsService.getPayments().subscribe({
      next: payments => this.payments.set(payments.map(p => this.mapToAdminPayment(p))),
      error: () => this.toast.showError('Unable to load payments.'),
    });
  }

  private mapToAdminPayment(p: ApiPayment): AdminPayment {
    const reservationInfo = p.reservation_info as { space_name?: string };
    return {
      id: p.id,
      invoice: p.transaction_id ?? `INV-${String(p.id).padStart(4, '0')}`,
      user: p.user_email,
      space: reservationInfo?.space_name ?? '—',
      date: p.paid_at ?? p.created_at,
      amount: p.amount,
      status: p.status === 'completed' ? 'paid' : (p.status === 'pending' || p.status === 'refunded' ? p.status : 'pending'),
    };
  }

  setFilter(f: 'all' | 'paid' | 'pending' | 'refunded'): void {
    this.activeFilter.set(f);
    this.page.set(1);
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      paid:     'bg-[#CEF09D] text-zinc-800',
      pending:  'bg-[#FDD5AB] text-zinc-800',
      refunded: 'bg-[#FBCBE3] text-zinc-800',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-600';
  }

  askAction(id: number, target: 'paid' | 'refunded'): void {
    this.pendingAction.set({ id, target });
  }

  confirmAction(): void {
    const a = this.pendingAction();
    if (!a) return;

    const request = a.target === 'paid'
      ? this.paymentsService.confirmPayment(a.id, { status: 'completed' })
      : this.paymentsService.refundPayment(a.id);

    request.subscribe({
      next: () => {
        this.loadPayments();
        this.toast.showSuccess(a.target === 'paid' ? 'Invoice marked as paid.' : 'Payment refunded.');
        this.pendingAction.set(null);
      },
      error: () => this.toast.showError('Unable to update the payment.'),
    });
  }

  cancelAction(): void {
    this.pendingAction.set(null);
  }

  get confirmTitle(): string {
    return this.pendingAction()?.target === 'paid' ? 'Mark as paid?' : 'Refund this payment?';
  }

  get confirmMessage(): string {
    return this.pendingAction()?.target === 'paid'
      ? 'This invoice will be marked as paid.'
      : 'This payment will be marked as refunded. This cannot be undone.';
  }

  get confirmLabel(): string {
    return this.pendingAction()?.target === 'paid' ? 'Mark as paid' : 'Refund';
  }
}
