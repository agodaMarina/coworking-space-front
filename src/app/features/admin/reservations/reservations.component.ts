import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Room } from '../../../core/dtos/room';
import { ReservationsService } from '../../../core/services/reservations.service';
import { RoomsService } from '../../../core/services/rooms.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

// Vue plate d'une réservation pour l'administration
export interface AdminReservation {
  id:        string;
  roomId:    string;
  roomName:  string;
  startTime: string;
  endTime:   string;
  createdBy: string;
  isUpcoming: boolean;
}

@Component({
  standalone: true,
  selector: 'app-admin-reservations',
  imports: [NgClass, DatePipe, ConfirmDialogComponent, PaginationComponent],
  templateUrl: './reservations.component.html',
  providers: [MessageService],
})
export class AdminReservationsComponent implements OnInit {
  private readonly roomsService        = inject(RoomsService);
  private readonly reservationsService = inject(ReservationsService);
  private readonly toast               = inject(ToastService);

  readonly reservations    = signal<AdminReservation[]>([]);
  readonly isLoading       = signal(true);
  readonly activeFilter    = signal<'all' | 'upcoming' | 'past'>('all');
  readonly page            = signal(1);
  readonly pageSize        = 10;
  readonly pendingCancelId = signal<{ roomId: string; resId: string } | null>(null);

  readonly filters = [
    { key: 'all'      as const, label: 'Toutes'  },
    { key: 'upcoming' as const, label: 'À venir' },
    { key: 'past'     as const, label: 'Passées' },
  ];

  readonly filtered = computed(() => {
    const now = new Date();
    const all = this.reservations();
    switch (this.activeFilter()) {
      case 'upcoming': return all.filter(r => r.isUpcoming);
      case 'past':     return all.filter(r => !r.isUpcoming);
      default:         return all;
    }
  });

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly stats = computed(() => ({
    total:    this.reservations().length,
    upcoming: this.reservations().filter(r => r.isUpcoming).length,
    past:     this.reservations().filter(r => !r.isUpcoming).length,
  }));

  ngOnInit(): void {
    this.loadAllReservations(null);
  }

  private loadAllReservations(cursor: string | null): void {
    this.isLoading.set(true);
    this.roomsService.getRooms({ limit: 100, ...(cursor ? { cursor } : {}) }).subscribe({
      next: (res) => {
        const now = new Date();
        const views: AdminReservation[] = res.items.flatMap(room =>
          (room.reservations ?? []).map(r => ({
            id:         r.id,
            roomId:     room.id,
            roomName:   room.name,
            startTime:  r.start_time,
            endTime:    r.end_time,
            createdBy:  r.created_by,
            isUpcoming: new Date(r.end_time) > now,
          }))
        );
        this.reservations.update(list => [...list, ...views]);

        if (res.has_more && res.next_cursor) {
          this.loadAllReservations(res.next_cursor);
        } else {
          // Trier par date de début descend
          this.reservations.update(list =>
            [...list].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          );
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.showError('Impossible de charger les réservations.');
      },
    });
  }

  setFilter(f: 'all' | 'upcoming' | 'past'): void {
    this.activeFilter.set(f);
    this.page.set(1);
  }

  askCancel(roomId: string, resId: string): void {
    this.pendingCancelId.set({ roomId, resId });
  }

  cancelCancel(): void {
    this.pendingCancelId.set(null);
  }

  confirmCancel(): void {
    const pending = this.pendingCancelId();
    if (!pending) return;
    this.pendingCancelId.set(null);

    this.reservationsService.cancelReservation(pending.roomId, pending.resId).subscribe({
      next: () => {
        this.reservations.update(list => list.filter(r => r.id !== pending.resId));
        this.toast.showSuccess('Réservation annulée.');
      },
      error: () => this.toast.showError('Impossible d\'annuler cette réservation.'),
    });
  }
}
