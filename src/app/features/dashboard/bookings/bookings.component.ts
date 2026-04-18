import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Reservation } from '../../../core/dtos/reservation';
import { ReservationsService } from '../../../core/services/reservations.service';

type Filter = 'all' | 'upcoming' | 'past' | 'cancelled';

@Component({
  standalone: true,
  selector: 'app-bookings',
  imports: [NgClass, DatePipe, CurrencyPipe],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css',
})
export class BookingsComponent implements OnInit {
  private readonly reservationsService = inject(ReservationsService);

  readonly reservations = signal<Reservation[]>([]);
  readonly activeFilter = signal<Filter>('all');
  readonly isLoading = this.reservationsService.isLoading;
  readonly cancellingId = signal<number | null>(null);

  readonly filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  readonly filtered = computed(() => {
    const now = new Date();
    const all = this.reservations();
    switch (this.activeFilter()) {
      case 'upcoming': return all.filter(r => r.status !== 'cancelled' && new Date(r.start_datetime) > now);
      case 'past': return all.filter(r => r.status !== 'cancelled' && new Date(r.end_datetime) <= now);
      case 'cancelled': return all.filter(r => r.status === 'cancelled');
      default: return all;
    }
  });

  ngOnInit(): void {
    this.reservationsService.getReservations().subscribe({
      next: (res) => this.reservations.set(res),
    });
  }

  cancel(id: number): void {
    this.cancellingId.set(id);
    this.reservationsService.cancelReservation(id).subscribe({
      next: () => {
        this.reservations.update(list =>
          list.map(r => r.id === id ? { ...r, status: 'cancelled', status_display: 'Cancelled' } : r)
        );
        this.cancellingId.set(null);
      },
      error: () => this.cancellingId.set(null),
    });
  }

  canCancel(r: Reservation): boolean {
    return r.status !== 'cancelled' && new Date(r.start_datetime) > new Date();
  }

  statusClass(status: string): string {
    return {
      confirmed: 'bg-[#CEF09D] text-black',
      pending: 'bg-[#FDD5AB] text-black',
      cancelled: 'bg-zinc-100 text-zinc-400',
    }[status] ?? 'bg-zinc-100 text-zinc-500';
  }
}
