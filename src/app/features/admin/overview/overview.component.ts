import { Component, inject, OnInit, signal } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { AdminDashboardService, DashboardStats } from '../../../core/services/admin/admin-dashboard.service';
import { ReservationsService } from '../../../core/services/reservations.service';
import { Reservation } from '../../../core/dtos/reservation';
import { ToastService } from '../../../core/services/toast.service';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-admin-overview',
  imports: [NgClass, DatePipe, FormsModule, RouterLink, TableComponent, ColumnComponent],
  templateUrl: './overview.component.html',
  providers: [MessageService]
})
export class AdminOverviewComponent implements OnInit {
  private readonly dashboardService    = inject(AdminDashboardService);
  private readonly reservationsService = inject(ReservationsService);
  private readonly toast               = inject(ToastService);

  readonly stats = signal<DashboardStats>({
    total_reservations: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    total_revenue: 0,
    occupancy_rate: 0,
    today_reservations: 0,
  });

  readonly recentReservations = signal<Reservation[]>([]);
  readonly isLoading    = signal(true);
  readonly isExporting  = signal(false);

  dateFrom = '';
  dateTo   = '';

  ngOnInit(): void {
    this.reservationsService.disableMocks();
    this.loadDashboard();
    this.loadRecentReservations();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.dashboardService.getDashboard(this.dateFrom || undefined, this.dateTo || undefined).subscribe({
      next: data => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.showError('Unable to load dashboard data.');
      },
    });
  }

  loadRecentReservations(): void {
    this.reservationsService.getReservations({ ordering: '-created_at' }).subscribe({
      next: list => this.recentReservations.set(list.slice(0, 5)),
      error: () => {},
    });
  }

  applyDateFilter(): void {
    this.loadDashboard();
  }

  exportCsv(): void {
    this.isExporting.set(true);
    this.dashboardService.exportReservationsCsv().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reservations-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.isExporting.set(false);
        this.toast.showSuccess('CSV exported.');
      },
      error: () => {
        this.isExporting.set(false);
        this.toast.showError('Unable to export CSV.');
      },
    });
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      confirmed: 'bg-[#CEF09D] text-zinc-800',
      pending:   'bg-[#FDD5AB] text-zinc-800',
      cancelled: 'bg-zinc-100 text-zinc-500',
      completed: 'bg-[#AEE9F4] text-zinc-800',
      rejected:  'bg-[#FBCBE3] text-zinc-800',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-600';
  }
}
