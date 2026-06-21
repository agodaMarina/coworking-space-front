import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Room, RoomReservation } from '../../../core/dtos/room';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ReservationsService } from '../../../core/services/reservations.service';
import { RoomsService } from '../../../core/services/rooms.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

// Vue enrichie d'une réservation (room info + reservation info)
export interface MyBooking {
  reservationId: string;
  roomId:        string;
  roomName:      string;
  roomCapacity:  number;
  startTime:     string;
  endTime:       string;
  cancellationAllowed:       boolean;
  cancellationDeadlineHours: number;
}

type Filter = 'all' | 'upcoming' | 'past';

const PAGE_SIZE = 8;

@Component({
  standalone: true,
  selector: 'app-bookings',
  imports: [NgClass, DatePipe, RouterLink, ConfirmDialogComponent],
  templateUrl: './bookings.component.html',
  providers: [MessageService],
})
export class BookingsComponent implements OnInit {
  private readonly roomsService        = inject(RoomsService);
  private readonly reservationsService = inject(ReservationsService);
  private readonly authService         = inject(AuthService);
  private readonly toast               = inject(ToastService);

  readonly myBookings   = signal<MyBooking[]>([]);
  readonly isLoading    = signal(false);
  readonly activeFilter = signal<Filter>('upcoming');
  readonly page         = signal(1);
  readonly pageSize     = PAGE_SIZE;
  readonly pendingCancel = signal<MyBooking | null>(null);
  readonly cancellingId  = signal<string | null>(null);

  readonly filters: { key: Filter; label: string }[] = [
    { key: 'all',      label: 'Toutes'  },
    { key: 'upcoming', label: 'À venir' },
    { key: 'past',     label: 'Passées' },
  ];

  readonly allFiltered = computed(() => {
    const now = new Date();
    const all = this.myBookings();
    switch (this.activeFilter()) {
      case 'upcoming': return all.filter(b => new Date(b.endTime) > now);
      case 'past':     return all.filter(b => new Date(b.endTime) <= now);
      default:         return all;
    }
  });

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.allFiltered().slice(start, start + PAGE_SIZE);
  });

  ngOnInit(): void {
    this.loadMyBookings();
  }

  // Charge toutes les salles et filtre les réservations appartenant à l'utilisateur courant
  loadMyBookings(): void {
    const userId = this.authService.user()?.id;
    if (!userId) return;

    this.isLoading.set(true);
    this.loadAllRooms(userId, [], null);
  }

  private loadAllRooms(userId: string, accumulated: MyBooking[], cursor: string | null): void {
    this.roomsService.getRooms({ limit: 100, ...(cursor ? { cursor } : {}) }).subscribe({
      next: (res) => {
        const newBookings = this.extractUserBookings(res.items, userId);
        const all = [...accumulated, ...newBookings];

        if (res.has_more && res.next_cursor) {
          this.loadAllRooms(userId, all, res.next_cursor);
        } else {
          // Trier par date de début (les plus récentes en premier)
          all.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
          this.myBookings.set(all);
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.toast.showError('Impossible de charger vos réservations.');
        this.isLoading.set(false);
      },
    });
  }

  private extractUserBookings(rooms: Room[], userId: string): MyBooking[] {
    const bookings: MyBooking[] = [];
    for (const room of rooms) {
      for (const res of room.reservations ?? []) {
        if (res.created_by === userId) {
          bookings.push({
            reservationId:             res.id,
            roomId:                    room.id,
            roomName:                  room.name,
            roomCapacity:              room.capacity,
            startTime:                 res.start_time,
            endTime:                   res.end_time,
            cancellationAllowed:       room.cancellation_allowed,
            cancellationDeadlineHours: room.cancellation_deadline_hours,
          });
        }
      }
    }
    return bookings;
  }

  // ── Annulation ─────────────────────────────────────────────────────────────

  canCancel(b: MyBooking): boolean {
    if (!b.cancellationAllowed) return false;
    if (new Date(b.endTime) <= new Date()) return false;
    const hoursUntil = (new Date(b.startTime).getTime() - Date.now()) / 3_600_000;
    return hoursUntil >= b.cancellationDeadlineHours;
  }

  askCancel(b: MyBooking): void {
    this.pendingCancel.set(b);
  }

  cancelCancel(): void {
    this.pendingCancel.set(null);
  }

  confirmCancel(): void {
    const b = this.pendingCancel();
    if (!b) return;
    this.pendingCancel.set(null);
    this.cancellingId.set(b.reservationId);

    this.reservationsService.cancelReservation(b.roomId, b.reservationId).subscribe({
      next: () => {
        this.myBookings.update(list => list.filter(x => x.reservationId !== b.reservationId));
        this.cancellingId.set(null);
        this.toast.showSuccess('Réservation annulée.');
      },
      error: () => this.cancellingId.set(null),
    });
  }

  // ── Filtres & pagination ───────────────────────────────────────────────────

  setFilter(f: Filter): void {
    this.activeFilter.set(f);
    this.page.set(1);
  }
}
