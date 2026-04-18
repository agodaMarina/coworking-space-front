import { Component, computed, signal } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { ToastService } from '../../../core/services/toast.service';

export interface Payment {
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
})
export class AdminPaymentsComponent {
  readonly activeFilter = signal<'all' | 'paid' | 'pending' | 'refunded'>('all');
  readonly page         = signal(1);
  readonly pageSize     = PAGE_SIZE;
  readonly pendingAction = signal<StatusAction | null>(null);

  constructor(private toast: ToastService) {}

  readonly filters = [
    { key: 'all' as const,      label: 'All'      },
    { key: 'paid' as const,     label: 'Paid'     },
    { key: 'pending' as const,  label: 'Pending'  },
    { key: 'refunded' as const, label: 'Refunded' },
  ];

  readonly payments = signal<Payment[]>([
    { id: 1,  invoice: 'INV-0001', user: 'Alice Martin',  space: 'Open Space A',     date: '2024-04-10', amount: 240,  status: 'paid'     },
    { id: 2,  invoice: 'INV-0002', user: 'Bob Johnson',   space: 'Meeting Room 1',   date: '2024-04-12', amount: 120,  status: 'pending'  },
    { id: 3,  invoice: 'INV-0003', user: 'Carol White',   space: 'Private Office 3', date: '2024-04-01', amount: 1200, status: 'paid'     },
    { id: 4,  invoice: 'INV-0004', user: 'David Brown',   space: 'Hot Desk B',       date: '2024-04-14', amount: 80,   status: 'refunded' },
    { id: 5,  invoice: 'INV-0005', user: 'Eva Green',     space: 'Conference Hall',  date: '2024-04-20', amount: 350,  status: 'pending'  },
    { id: 6,  invoice: 'INV-0006', user: 'Frank Taylor',  space: 'Open Space B',     date: '2024-04-22', amount: 400,  status: 'paid'     },
    { id: 7,  invoice: 'INV-0007', user: 'Grace Wilson',  space: 'Hot Desk A',       date: '2024-04-08', amount: 80,   status: 'refunded' },
    { id: 8,  invoice: 'INV-0008', user: 'Alice Martin',  space: 'Meeting Room 1',   date: '2024-04-25', amount: 240,  status: 'pending'  },
    { id: 9,  invoice: 'INV-0009', user: 'Bob Johnson',   space: 'Open Space A',     date: '2024-04-26', amount: 50,   status: 'paid'     },
    { id: 10, invoice: 'INV-0010', user: 'Eva Green',     space: 'Private Office 3', date: '2024-04-27', amount: 600,  status: 'pending'  },
  ]);

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
    this.payments.update(list =>
      list.map(p => p.id === a.id ? { ...p, status: a.target } : p)
    );
    this.toast.showSuccess(
      a.target === 'paid' ? 'Invoice marked as paid.' : 'Payment refunded.'
    );
    this.pendingAction.set(null);
  }

  cancelAction(): void {
    this.pendingAction.set(null);
  }

  get confirmTitle(): string {
    return this.pendingAction()?.target === 'paid'
      ? 'Mark as paid?'
      : 'Refund this payment?';
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
