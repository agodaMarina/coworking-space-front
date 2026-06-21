import { Injectable, signal } from '@angular/core';
import { Observable, defer, finalize } from 'rxjs';
import {
  CancelReservationResponse,
  CreateReservationPayload,
  Reservation,
} from '../dtos/reservation';
import { ApiService } from '../http/api.service';

@Injectable({ providedIn: 'root' })
export class ReservationsService extends ApiService {
  readonly isLoading = signal(false);

  // ── Créer une réservation ───────────────────────────────────────────────────
  // POST /api/rooms/:roomId/reservations
  createReservation(roomId: string, payload: CreateReservationPayload): Observable<Reservation> {
    return this.withLoading(
      this.post<Reservation>(`/rooms/${roomId}/reservations`, payload)
    );
  }

  // ── Annuler une réservation ─────────────────────────────────────────────────
  // DELETE /api/rooms/:roomId/reservations/:reservationId
  cancelReservation(roomId: string, reservationId: string): Observable<CancelReservationResponse> {
    return this.withLoading(
      this.delete<CancelReservationResponse>(
        `/rooms/${roomId}/reservations/${reservationId}`
      )
    );
  }

  // ── Utilitaires ─────────────────────────────────────────────────────────────

  private withLoading<T>(source: Observable<T>): Observable<T> {
    return defer(() => {
      this.isLoading.set(true);
      return source.pipe(finalize(() => this.isLoading.set(false)));
    });
  }
}
