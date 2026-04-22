import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReservationsService } from '../../../core/services/reservations.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../core/services/toast.service';
import { Reservation } from '../../../core/dtos/reservation';
import { MessageService } from 'primeng/api';

type Filter = 'all' | 'upcoming' | 'past' | 'cancelled';

const PAGE_SIZE = 6;

@Component({
  standalone: true,
  selector: 'app-bookings',
  imports: [NgClass, DatePipe, CurrencyPipe, RouterLink, PaginationComponent, ConfirmDialogComponent, TableComponent, ColumnComponent],
  templateUrl: './bookings.component.html',
  providers:[MessageService]
})
export class BookingsComponent implements OnInit {
  private readonly reservationsService = inject(ReservationsService);
  private readonly toast               = inject(ToastService);

  readonly reservations  = signal<Reservation[]>([]);
  readonly activeFilter  = signal<Filter>('all');
  readonly isLoading     = this.reservationsService.isLoading;
  readonly cancellingId  = signal<number | null>(null);
  readonly selectedId    = signal<number | null>(null);
  readonly pendingCancel = signal<number | null>(null);
  readonly page          = signal(1);
  readonly pageSize      = PAGE_SIZE;

  readonly filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  readonly allFiltered = computed(() => {
    const now = new Date();
    const all = this.reservations();
    switch (this.activeFilter()) {
      case 'upcoming': return all.filter(r => r.status !== 'cancelled' && new Date(r.start_datetime) > now);
      case 'past': return all.filter(r => r.status !== 'cancelled' && new Date(r.end_datetime) <= now);
      case 'cancelled': return all.filter(r => r.status === 'cancelled');
      default: return all;
    }
  });

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.allFiltered().slice(start, start + PAGE_SIZE);
  });

  readonly selected = computed(() =>
    this.reservations().find(r => r.id === this.selectedId()) ?? null
  );

  ngOnInit(): void {
    this.reservationsService.disableMocks();
    this.reservationsService.getReservations().subscribe({
      next: (res) => this.reservations.set(res),
    });
  }

  setFilter(f: Filter): void {
    this.activeFilter.set(f);
    this.page.set(1);
  }

  openDetail(id: number): void {
    this.selectedId.set(id);
  }

  closeDetail(): void {
    this.selectedId.set(null);
  }

  askCancel(id: number): void {
    this.pendingCancel.set(id);
  }

  confirmCancel(): void {
    const id = this.pendingCancel();
    if (id === null) return;
    this.pendingCancel.set(null);
    this.cancellingId.set(id);
    this.reservationsService.cancelReservation(id).subscribe({
      next: () => {
        this.reservations.update(list =>
          list.map(r => r.id === id ? { ...r, status: 'cancelled', status_display: 'Cancelled' } : r)
        );
        this.cancellingId.set(null);
        this.closeDetail();
        this.toast.showSuccess('Booking cancelled.');
      },
      error: () => this.cancellingId.set(null),
    });
  }

  cancelCancel(): void {
    this.pendingCancel.set(null);
  }

  canCancel(r: Reservation): boolean {
    return r.status !== 'cancelled' && new Date(r.start_datetime) > new Date();
  }

  statusClass(status: string): string {
    return ({
      confirmed: 'bg-[#CEF09D] text-black',
      pending: 'bg-[#FDD5AB] text-black',
      cancelled: 'bg-zinc-100 text-zinc-400',
    } as Record<string, string>)[status] ?? 'bg-zinc-100 text-zinc-500';
  }
}
