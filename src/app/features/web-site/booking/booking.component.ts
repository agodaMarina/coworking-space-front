import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Room } from '../../../core/dtos/room';
import { CreateReservationPayload } from '../../../core/dtos/reservation';
import { ReservationsService } from '../../../core/services/reservations.service';
import { RoomsService } from '../../../core/services/rooms.service';
import { ToastService } from '../../../core/services/toast.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';

type BookingStep = 'details' | 'success';

@Component({
  standalone: true,
  selector: 'app-booking-page',
  imports: [NgClass, DatePipe, FormsModule, ReactiveFormsModule,
            RouterLink, HeaderComponent, FooterComponent, ToastModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  providers: [MessageService],
})
export class BookingPageComponent implements OnInit {
  private readonly fb                  = inject(FormBuilder);
  private readonly roomsService        = inject(RoomsService);
  private readonly reservationsService = inject(ReservationsService);
  private readonly route               = inject(ActivatedRoute);
  private readonly router              = inject(Router);
  private readonly toastService        = inject(ToastService);

  readonly currentStep   = signal<BookingStep>('details');
  readonly isSubmitting  = signal(false);
  readonly selectedRoom  = signal<Room | null>(null);
  readonly availableRooms = signal<Room[]>([]);
  readonly roomDropdownOpen = signal(false);
  readonly nextCursor    = signal<string | null>(null);
  readonly hasMore       = signal(false);

  bookingForm!: FormGroup;

  // Créneaux déjà occupés dans la salle sélectionnée (à venir)
  readonly takenSlots = computed(() => {
    const room = this.selectedRoom();
    if (!room) return [];
    const now = new Date();
    return room.reservations.filter(r => new Date(r.end_time) > now);
  });

  ngOnInit(): void {
    this.initializeForm();
    this.loadRooms();

    this.route.queryParams.subscribe(params => {
      const roomId = params['roomId'];
      if (roomId) {
        this.roomsService.getRoom(roomId).subscribe({
          next: (room) => {
            this.selectedRoom.set(room);
            this.bookingForm.patchValue({ roomId: room.id });
          },
        });
      }
    });
  }

  initializeForm(): void {
    this.bookingForm = this.fb.group({
      roomId:    ['', Validators.required],
      startDate: ['', Validators.required],
      startTime: ['09:00', Validators.required],
      endDate:   ['', Validators.required],
      endTime:   ['10:00', Validators.required],
    });
  }

  loadRooms(append = false): void {
    this.roomsService.getRooms({ limit: 20, ...(append && this.nextCursor() ? { cursor: this.nextCursor()! } : {}) })
      .subscribe({
        next: (res) => {
          this.availableRooms.set(append ? [...this.availableRooms(), ...res.items] : res.items);
          this.nextCursor.set(res.next_cursor);
          this.hasMore.set(res.has_more);
        },
      });
  }

  selectRoom(room: Room): void {
    this.selectedRoom.set(room);
    this.bookingForm.patchValue({ roomId: room.id });
    this.roomDropdownOpen.set(false);
  }

  submitBooking(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const fv = this.bookingForm.value;

    // Construire les dates ISO 8601 UTC
    const startDt = this.buildISODate(fv.startDate, fv.startTime);
    const endDt   = this.buildISODate(fv.endDate,   fv.endTime);

    if (!startDt || !endDt) {
      this.toastService.showError('Dates invalides. Vérifiez les champs.');
      return;
    }

    if (startDt >= endDt) {
      this.toastService.showError('L\'heure de début doit être avant l\'heure de fin.');
      return;
    }

    const payload: CreateReservationPayload = {
      start_time: startDt,
      end_time:   endDt,
    };

    this.isSubmitting.set(true);
    this.reservationsService.createReservation(fv.roomId, payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.currentStep.set('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => {
        this.isSubmitting.set(false);
        // Le message d'erreur (RESERVATION_OVERLAP, etc.) est géré par l'intercepteur
      },
    });
  }

  resetFlow(): void {
    this.bookingForm.reset({ startTime: '09:00', endTime: '10:00' });
    this.selectedRoom.set(null);
    this.currentStep.set('details');
  }

  isFieldInvalid(field: string): boolean {
    const f = this.bookingForm.get(field);
    return !!(f && f.invalid && f.touched);
  }

  today(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Calcule la durée en heures pour l'affichage
  durationHours(): number {
    const fv = this.bookingForm.value;
    const start = this.buildISODate(fv.startDate, fv.startTime);
    const end   = this.buildISODate(fv.endDate,   fv.endTime);
    if (!start || !end) return 0;
    return Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 3_600_000);
  }

  // Vérifie si le créneau saisi entre en conflit avec une réservation existante
  hasConflict(): boolean {
    const fv = this.bookingForm.value;
    const start = this.buildISODate(fv.startDate, fv.startTime);
    const end   = this.buildISODate(fv.endDate,   fv.endTime);
    if (!start || !end) return false;

    const room = this.selectedRoom();
    const gapMs = (room?.gap_minutes ?? 0) * 60_000;

    return this.takenSlots().some(slot => {
      const slotStart = new Date(slot.start_time).getTime() - gapMs;
      const slotEnd   = new Date(slot.end_time).getTime()   + gapMs;
      const reqStart  = new Date(start).getTime();
      const reqEnd    = new Date(end).getTime();
      return reqStart < slotEnd && reqEnd > slotStart;
    });
  }

  private buildISODate(date: string, time: string): string | null {
    if (!date || !time) return null;
    const [h, m] = time.split(':').map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
}
