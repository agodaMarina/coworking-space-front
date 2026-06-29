import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Room, RoomReservation } from '../../../../core/dtos/room';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { RoomsService } from '../../../../core/services/rooms.service';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-space-detail-page',
  imports: [NgClass, DatePipe, HeaderComponent, FooterComponent, ProgressSpinnerModule],
  templateUrl: './space-detail.component.html',
  styleUrls: ['./space-detail.component.css'],
  providers: [MessageService],
})
export class SpaceDetailPageComponent implements OnInit {
  private readonly route        = inject(ActivatedRoute);
  private readonly router       = inject(Router);
  private readonly roomsService = inject(RoomsService);
  private readonly authService  = inject(AuthService);

  readonly room    = signal<Room | null>(null);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;
      this.loading.set(true);
      this.roomsService.getRoom(id).subscribe({
        next:     (r)   => { this.room.set(r); this.loading.set(false); },
        error:    (err) => { console.error('Erreur chargement salle', err); this.loading.set(false); },
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/rooms']);
  }

  goToBooking(): void {
    const r = this.room();
    if (!r) return;
    this.router.navigate(['/booking'], { queryParams: { roomId: r.id } });
  }

  // Réservations à venir uniquement
  upcomingReservations(): RoomReservation[] {
    const now = new Date();
    return (this.room()?.reservations ?? [])
      .filter(r => new Date(r.end_time) > now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  // Vérifie si l'annulation est encore possible pour un créneau
  canCancelReservation(res: RoomReservation): boolean {
    const room = this.room();
    if (!room?.cancellation_allowed) return false;
    const userId = this.authService.user()?.id;
    if (res.created_by !== userId) return false;
    const deadline = room.cancellation_deadline_hours ?? 0;
    const hoursUntilStart = (new Date(res.start_time).getTime() - Date.now()) / 3_600_000;
    return hoursUntilStart >= deadline;
  }

  // Retourne les initiales de l'utilisateur qui a fait la réservation (masqué si ce n'est pas nous)
  isMyReservation(res: RoomReservation): boolean {
    return res.created_by === this.authService.user()?.id;
  }

  getRoomImage(roomId: string, w = 1200, h = 600): string {
    return `https://picsum.photos/seed/${roomId}/${w}/${h}`;
  }
}
