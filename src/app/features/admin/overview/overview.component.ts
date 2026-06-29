import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Room } from '../../../core/dtos/room';
import { RoomsService } from '../../../core/services/rooms.service';
import { ToastService } from '../../../core/services/toast.service';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';

interface ReservationView {
  id:        string;
  roomName:  string;
  roomId:    string;
  startTime: string;
  endTime:   string;
  isUpcoming: boolean;
  createdBy: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-overview',
  imports: [NgClass, DatePipe, RouterLink, FormsModule, TableComponent, ColumnComponent],
  templateUrl: './overview.component.html',
  providers: [MessageService],
})
export class AdminOverviewComponent implements OnInit {
  private readonly roomsService = inject(RoomsService);
  private readonly toast        = inject(ToastService);

  readonly rooms           = signal<Room[]>([]);
  readonly isLoading       = signal(true);
  readonly allReservations = signal<ReservationView[]>([]);
  readonly isExporting     = signal(false);

  dateFrom = '';
  dateTo   = '';

  readonly stats = computed(() => {
    const now = new Date();
    const res = this.allReservations();
    const today = res.filter(r => new Date(r.startTime).toDateString() === now.toDateString());
    return {
      total_bookings:      res.length,
      confirmed_bookings:  res.filter(r => r.isUpcoming).length,
      today_reservations:  today.length,
      total_revenue:       0,
      cancelled_bookings:  0,
      completed_bookings:  res.filter(r => !r.isUpcoming).length,
      occupancy_rate:      0,
    };
  });

  readonly recentReservations = computed(() =>
    [...this.allReservations()]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 8)
  );

  ngOnInit(): void {
    this.loadData(null);
  }

  private loadData(cursor: string | null): void {
    this.isLoading.set(true);
    this.roomsService.getRooms({ limit: 100, ...(cursor ? { cursor } : {}) }).subscribe({
      next: (res) => {
        this.rooms.update(list => [...list, ...res.items]);
        const now = new Date();
        const views: ReservationView[] = res.items.flatMap(room =>
          (room.reservations ?? []).map(r => ({
            id:         r.id,
            roomName:   room.name,
            roomId:     room.id,
            startTime:  r.start_time,
            endTime:    r.end_time,
            createdBy:  r.created_by ?? '',
            isUpcoming: new Date(r.end_time) > now,
          }))
        );
        this.allReservations.update(list => [...list, ...views]);

        if (res.has_more && res.next_cursor) {
          this.loadData(res.next_cursor);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.showError('Impossible de charger les données.');
      },
    });
  }

  applyDateFilter(): void {
    // Le filtrage par date sera appliqué côté client via recentReservations
  }

  exportCsv(): void {
    this.isExporting.set(true);
    const rows = this.allReservations();
    const csv = [
      'Salle,Début,Fin,Statut',
      ...rows.map(r => `${r.roomName},${r.startTime},${r.endTime},${r.isUpcoming ? 'À venir' : 'Passée'}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'reservations.csv';
    a.click();
    URL.revokeObjectURL(url);
    this.isExporting.set(false);
  }

  statusBadge(isUpcoming: boolean): Record<string, boolean> {
    return isUpcoming
      ? { 'bg-[#CEF09D] text-zinc-800': true }
      : { 'bg-zinc-100 text-zinc-500': true };
  }
}
