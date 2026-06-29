import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Room } from '../../../core/dtos/room';
import { AuthService } from '../../../core/services/auth/auth.service';
import { RoomsService } from '../../../core/services/rooms.service';

interface MyBookingView {
  reservationId: string;
  roomName:      string;
  roomId:        string;
  startTime:     string;
  endTime:       string;
}

@Component({
  standalone: true,
  selector: 'app-overview',
  imports: [NgClass, DatePipe, RouterLink],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
  providers: [MessageService],
})
export class OverviewComponent implements OnInit {
  private readonly roomsService = inject(RoomsService);
  private readonly authService  = inject(AuthService);

  readonly user        = this.authService.user;
  readonly myBookings  = signal<MyBookingView[]>([]);
  readonly isLoading   = signal(false);
  isUpcoming(endTime: string): boolean {
    return new Date(endTime) > new Date();
  }

  getRoomImage(roomId: string, w = 80, h = 60): string {
    return `https://picsum.photos/seed/${roomId}/${w}/${h}`;
  }

  readonly stats = computed(() => {
    const now      = new Date();
    const all      = this.myBookings();
    const upcoming = all.filter(b => new Date(b.endTime) > now);
    return {
      total:    all.length,
      upcoming: upcoming.length,
    };
  });

  readonly recentBookings = computed(() =>
    [...this.myBookings()]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 4)
  );

  ngOnInit(): void {
    const userId = this.user()?.id;
    if (userId) this.loadMyBookings(userId, null);
  }

  private loadMyBookings(userId: string, cursor: string | null): void {
    this.isLoading.set(true);
    this.roomsService.getRooms({ limit: 100, ...(cursor ? { cursor } : {}) }).subscribe({
      next: (res) => {
        const views: MyBookingView[] = res.items.flatMap(room =>
          (room.reservations ?? [])
            .filter(r => r.created_by === userId)
            .map(r => ({
              reservationId: r.id,
              roomName:      room.name,
              roomId:        room.id,
              startTime:     r.start_time,
              endTime:       r.end_time,
            }))
        );
        this.myBookings.update(list => [...list, ...views]);

        if (res.has_more && res.next_cursor) {
          this.loadMyBookings(userId, res.next_cursor);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => this.isLoading.set(false),
    });
  }
}
