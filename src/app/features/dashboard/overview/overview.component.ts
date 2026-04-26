import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { Reservation } from '../../../core/dtos/reservation';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ReservationsService } from '../../../core/services/reservations.service';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-overview',
  imports: [NgClass, DatePipe, CurrencyPipe, RouterLink, TableComponent, ColumnComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
  providers:[MessageService]
})
export class OverviewComponent implements OnInit {
  private readonly reservationsService = inject(ReservationsService);
  private readonly authService = inject(AuthService);

  readonly user = this.authService.user;
  readonly reservations = signal<Reservation[]>([]);
  readonly isLoading = this.reservationsService.isLoading;

  readonly stats = computed(() => {
    const all = this.reservations();
    const now = new Date();
    const active = all.filter(r => r.status !== 'cancelled');
    const upcoming = all.filter(r => r.status !== 'cancelled' && new Date(r.start_datetime) > now);
    const totalSpent = active.reduce((sum, r) => sum + r.total_price, 0);
    return { total: all.length, active: active.length, upcoming: upcoming.length, spent: totalSpent };
  });

  readonly recentBookings = computed(() =>
    [...this.reservations()]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
  );

  ngOnInit(): void {
    this.reservationsService.getReservations().subscribe({
      next: (res) => this.reservations.set(res),
    });
  }

  statusClass(status: string): string {
    return {
      confirmed: 'bg-[#CEF09D] text-black',
      pending:   'bg-[#FDD5AB] text-black',
      cancelled: 'bg-zinc-100 text-zinc-400',
    }[status] ?? 'bg-zinc-100 text-zinc-500';
  }
}
