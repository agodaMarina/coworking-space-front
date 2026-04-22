
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe } from '@angular/common';

import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { Payment } from '../../../core/dtos/payment';
import { PaymentsService } from '../../../core/services/admin/payments.service';
import { ToastService } from '../../../core/services/toast.service';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-dashboard-payments',
  imports: [NgClass, DatePipe, TableComponent, ColumnComponent],
  templateUrl: './payments.component.html',
  providers: [MessageService]
})
export class DashboardPaymentsComponent implements OnInit {
  private readonly paymentsService = inject(PaymentsService);
  private readonly toast = inject(ToastService);

  readonly payments = signal<Payment[]>([]);
  readonly isLoading = this.paymentsService.isLoading;

  readonly stats = computed(() => {
    const all = this.payments();
    const completed = all.filter(p => p.status === 'completed');
    const pending   = all.filter(p => p.status === 'pending');
    return {
      totalPaid:  completed.reduce((s, p) => s + p.amount, 0),
      paid:       completed.length,
      pending:    pending.length,
      totalSpent: all.filter(p => p.status !== 'cancelled').reduce((s, p) => s + p.amount, 0),
    };
  });

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      completed: 'bg-[#CEF09D] text-zinc-800',
      pending:   'bg-[#FDD5AB] text-zinc-800',
      failed:    'bg-[#FBCBE3] text-zinc-800',
      refunded:  'bg-[#AEE9F4] text-zinc-800',
      cancelled: 'bg-zinc-100 text-zinc-500',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-600';
  }

  methodLabel(method: string): string {
    const map: Record<string, string> = {
      card:          'Carte',
      mobile_money:  'Mobile Money',
      cash:          'Espèces',
      bank_transfer: 'Virement',
    };
    return map[method] ?? method;
  }

  downloadInvoice(payment: Payment): void {
    this.paymentsService.downloadInvoice(payment.id).subscribe({
      next: text => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${payment.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.toast.showError('Unable to download invoice.'),
    });
  }

  ngOnInit(): void {
    this.paymentsService.disableMocks();
    this.paymentsService.getPayments().subscribe({
      next: p => this.payments.set(p),
      error: () => this.toast.showError('Unable to load payments.'),
    });
  }
}
