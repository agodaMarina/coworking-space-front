import { Component, computed, OnInit, signal } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
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

type StatusAction = { id: number; target: 'completed' | 'failed' | 'refunded' };

const PAGE_SIZE = 8;

@Component({
  standalone: true,
  selector: 'app-admin-payments',
  imports: [NgClass, CurrencyPipe, DatePipe, DecimalPipe, PaginationComponent, ConfirmDialogComponent, TableComponent, ColumnComponent],
  templateUrl: './payments.component.html',
  providers: [MessageService]
})
export class AdminPaymentsComponent implements OnInit {
  readonly activeFilter = signal<'all' | 'paid' | 'pending' | 'refunded'>('all');
  readonly page         = signal(1);
  readonly pageSize     = PAGE_SIZE;
  readonly pendingAction = signal<StatusAction | null>(null);
  readonly apiStats     = signal<any>({ total_revenue: 0, pending_payments: 0, refunded_payments: 0 });

  readonly filters = [
    { key: 'all' as const,      label: 'Tous'        },
    { key: 'paid' as const,     label: 'Payés'       },
    { key: 'pending' as const,  label: 'En attente'  },
    { key: 'refunded' as const, label: 'Remboursés'  },
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
    total:    this.apiStats().total_revenue || 0,
    pending:  this.apiStats().pending_payments || 0,
    refunded: this.apiStats().refunded_payments || 0,
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
      error: () => this.toast.showError('Impossible de charger les paiements.'),
    });
    this.paymentsService.getPaymentStats().subscribe({
      next: stats => this.apiStats.set(stats),
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

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      paid:     'Payé',
      pending:  'En attente',
      refunded: 'Remboursé',
    };
    return map[status] ?? status;
  }

  askAction(id: number, target: 'completed' | 'failed' | 'refunded'): void {
    this.pendingAction.set({ id, target });
  }

  confirmAction(): void {
    const a = this.pendingAction();
    if (!a) return;

    if (a.target === 'refunded') {
      this.paymentsService.refundPayment(a.id, {}).subscribe({
        next: () => {
          this.loadPayments();
          this.toast.showSuccess('Paiement remboursé.');
          this.pendingAction.set(null);
        },
        error: () => this.toast.showError('Impossible de mettre à jour le paiement.'),
      });
    } else {
      this.paymentsService.confirmPayment(a.id, { status: a.target }).subscribe({
        next: () => {
          this.loadPayments();
          this.toast.showSuccess(a.target === 'completed' ? 'Facture marquée comme payée.' : 'Facture rejetée.');
          this.pendingAction.set(null);
        },
        error: () => this.toast.showError('Impossible de mettre à jour le paiement.'),
      });
    }
  }

  cancelAction(): void {
    this.pendingAction.set(null);
  }

  get confirmTitle(): string {
    if (!this.pendingAction()) return '';
    const t = this.pendingAction()!.target;
    return t === 'completed' ? 'Marquer comme payé ?' : t === 'failed' ? 'Rejeter le paiement ?' : 'Rembourser ce paiement ?';
  }

  get confirmMessage(): string {
    if (!this.pendingAction()) return '';
    const t = this.pendingAction()!.target;
    return t === 'completed' ? 'Cette facture sera marquée comme payée.'
         : t === 'failed' ? 'Ce paiement sera rejeté.'
         : 'Ce paiement sera marqué comme remboursé. Cette action est irréversible.';
  }

  get confirmLabel(): string {
    if (!this.pendingAction()) return '';
    const t = this.pendingAction()!.target;
    return t === 'completed' ? 'Marquer payé' : t === 'failed' ? 'Rejeter' : 'Rembourser';
  }
}
