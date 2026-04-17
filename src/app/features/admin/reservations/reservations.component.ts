import { Component, computed, signal } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe } from '@angular/common';

export interface AdminReservation {
  id: number;
  user: string;
  space: string;
  start: string;
  end: string;
  billing: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
}

@Component({
  standalone: true,
  selector: 'app-admin-reservations',
  imports: [NgClass, CurrencyPipe, DatePipe],
  templateUrl: './reservations.component.html',
})
export class AdminReservationsComponent {
  readonly activeFilter = signal<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  readonly filters = [
    { key: 'all' as const,       label: 'All'       },
    { key: 'confirmed' as const, label: 'Confirmed' },
    { key: 'pending' as const,   label: 'Pending'   },
    { key: 'cancelled' as const, label: 'Cancelled' },
  ];

  readonly reservations = signal<AdminReservation[]>([
    { id: 1, user: 'Alice Martin',  space: 'Open Space A',     start: '2024-04-10', end: '2024-04-12', billing: 'Daily',   status: 'confirmed', amount: 240 },
    { id: 2, user: 'Bob Johnson',   space: 'Meeting Room 1',   start: '2024-04-15', end: '2024-04-15', billing: 'Hourly',  status: 'pending',   amount: 120 },
    { id: 3, user: 'Carol White',   space: 'Private Office 3', start: '2024-04-01', end: '2024-04-30', billing: 'Monthly', status: 'confirmed', amount: 1200 },
    { id: 4, user: 'David Brown',   space: 'Hot Desk B',       start: '2024-04-14', end: '2024-04-14', billing: 'Daily',   status: 'cancelled', amount: 80  },
    { id: 5, user: 'Eva Green',     space: 'Conference Hall',  start: '2024-04-20', end: '2024-04-20', billing: 'Hourly',  status: 'pending',   amount: 350 },
    { id: 6, user: 'Frank Taylor',  space: 'Open Space B',     start: '2024-04-22', end: '2024-04-26', billing: 'Daily',   status: 'confirmed', amount: 400 },
    { id: 7, user: 'Grace Wilson',  space: 'Hot Desk A',       start: '2024-04-08', end: '2024-04-08', billing: 'Daily',   status: 'cancelled', amount: 80  },
  ]);

  readonly filtered = computed(() => {
    const f = this.activeFilter();
    return f === 'all' ? this.reservations() : this.reservations().filter(r => r.status === f);
  });

  readonly stats = computed(() => ({
    total:     this.reservations().length,
    confirmed: this.reservations().filter(r => r.status === 'confirmed').length,
    pending:   this.reservations().filter(r => r.status === 'pending').length,
    cancelled: this.reservations().filter(r => r.status === 'cancelled').length,
  }));

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      confirmed: 'bg-[#CEF09D] text-zinc-800',
      pending:   'bg-[#FDD5AB] text-zinc-800',
      cancelled: 'bg-zinc-100 text-zinc-500',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-600';
  }
}
