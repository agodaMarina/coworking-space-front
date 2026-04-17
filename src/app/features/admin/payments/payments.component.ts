import { Component, computed, signal } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe } from '@angular/common';

export interface Payment {
  id: number;
  invoice: string;
  user: string;
  space: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded';
}

@Component({
  standalone: true,
  selector: 'app-admin-payments',
  imports: [NgClass, CurrencyPipe, DatePipe],
  templateUrl: './payments.component.html',
})
export class AdminPaymentsComponent {
  readonly activeFilter = signal<'all' | 'paid' | 'pending' | 'refunded'>('all');

  readonly filters = [
    { key: 'all' as const,      label: 'All'      },
    { key: 'paid' as const,     label: 'Paid'     },
    { key: 'pending' as const,  label: 'Pending'  },
    { key: 'refunded' as const, label: 'Refunded' },
  ];

  readonly payments = signal<Payment[]>([
    { id: 1, invoice: 'INV-0001', user: 'Alice Martin',  space: 'Open Space A',     date: '2024-04-10', amount: 240,  status: 'paid'     },
    { id: 2, invoice: 'INV-0002', user: 'Bob Johnson',   space: 'Meeting Room 1',   date: '2024-04-12', amount: 120,  status: 'pending'  },
    { id: 3, invoice: 'INV-0003', user: 'Carol White',   space: 'Private Office 3', date: '2024-04-01', amount: 1200, status: 'paid'     },
    { id: 4, invoice: 'INV-0004', user: 'David Brown',   space: 'Hot Desk B',       date: '2024-04-14', amount: 80,   status: 'refunded' },
    { id: 5, invoice: 'INV-0005', user: 'Eva Green',     space: 'Conference Hall',  date: '2024-04-20', amount: 350,  status: 'pending'  },
    { id: 6, invoice: 'INV-0006', user: 'Frank Taylor',  space: 'Open Space B',     date: '2024-04-22', amount: 400,  status: 'paid'     },
    { id: 7, invoice: 'INV-0007', user: 'Grace Wilson',  space: 'Hot Desk A',       date: '2024-04-08', amount: 80,   status: 'refunded' },
  ]);

  readonly filtered = computed(() => {
    const f = this.activeFilter();
    return f === 'all' ? this.payments() : this.payments().filter(p => p.status === f);
  });

  readonly stats = computed(() => ({
    total:    this.payments().reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0),
    paid:     this.payments().filter(p => p.status === 'paid').length,
    pending:  this.payments().filter(p => p.status === 'pending').length,
    refunded: this.payments().filter(p => p.status === 'refunded').length,
  }));

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      paid:     'bg-[#CEF09D] text-zinc-800',
      pending:  'bg-[#FDD5AB] text-zinc-800',
      refunded: 'bg-[#FBCBE3] text-zinc-800',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-600';
  }
}
