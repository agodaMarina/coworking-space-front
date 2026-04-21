import { HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { finalize, map, Observable, of, tap } from 'rxjs';
import { PaginatedResponse } from '../dtos/pagination';
import {
  CreateReservation,
  Reservation,
  ReservationAvailabilityPayload,
  ReservationListParams,
  ReservationUpdatePayload
} from '../dtos/reservation';
import { ApiService } from '../http/api.service';



@Injectable({
  providedIn: 'root'
})
export class ReservationsService extends ApiService {
  private readonly useMocks = signal(true);
  readonly isLoading = signal(false);

  private mockReservations: Reservation[] = [
    {
      id: 1,
      user_detail: { id: 1, email: 'user@example.com' },
      space_detail: { id: 3, name: 'Executive Meeting Room', space_type_display: 'Salle de réunion' },
      start_datetime: '2026-04-28T09:00:00Z',
      end_datetime: '2026-04-28T17:00:00Z',
      status: 'confirmed',
      status_display: 'Confirmed',
      total_price: 75,
      billing_type: 'daily',
      billing_type_display: 'Per day',
      duration_hours: 8,
      is_recurring: false,
      recurrence_rule: 'none',
      notes: 'Team weekly sync',
      created_at: '2026-04-10T00:00:00Z',
      updated_at: '2026-04-10T00:00:00Z'
    },
    {
      id: 2,
      user_detail: { id: 1, email: 'user@example.com' },
      space_detail: { id: 4, name: 'The Skyline Suite', space_type_display: 'Bureau privé' },
      start_datetime: '2026-05-05T09:00:00Z',
      end_datetime: '2026-05-07T17:00:00Z',
      status: 'pending',
      status_display: 'Pending',
      total_price: 360,
      billing_type: 'daily',
      billing_type_display: 'Per day',
      duration_hours: 48,
      is_recurring: false,
      recurrence_rule: 'none',
      notes: '',
      created_at: '2026-04-12T00:00:00Z',
      updated_at: '2026-04-12T00:00:00Z'
    },
    {
      id: 3,
      user_detail: { id: 1, email: 'user@example.com' },
      space_detail: { id: 5, name: 'The Boardroom', space_type_display: 'Salle de conférence' },
      start_datetime: '2026-05-12T09:00:00Z',
      end_datetime: '2026-05-12T18:00:00Z',
      status: 'confirmed',
      status_display: 'Confirmed',
      total_price: 350,
      billing_type: 'daily',
      billing_type_display: 'Per day',
      duration_hours: 9,
      is_recurring: false,
      recurrence_rule: 'none',
      notes: 'Q2 board meeting',
      created_at: '2026-04-14T00:00:00Z',
      updated_at: '2026-04-14T00:00:00Z'
    },
    {
      id: 4,
      user_detail: { id: 1, email: 'user@example.com' },
      space_detail: { id: 1, name: 'Downtown Desk #1', space_type_display: 'Bureau individuel' },
      start_datetime: '2026-03-20T09:00:00Z',
      end_datetime: '2026-03-22T17:00:00Z',
      status: 'confirmed',
      status_display: 'Confirmed',
      total_price: 75,
      billing_type: 'daily',
      billing_type_display: 'Per day',
      duration_hours: 48,
      is_recurring: false,
      recurrence_rule: 'none',
      notes: '',
      created_at: '2026-03-15T00:00:00Z',
      updated_at: '2026-03-15T00:00:00Z'
    },
    {
      id: 5,
      user_detail: { id: 1, email: 'user@example.com' },
      space_detail: { id: 2, name: 'Collaborative Space', space_type_display: 'Espace ouvert' },
      start_datetime: '2026-02-10T10:00:00Z',
      end_datetime: '2026-02-10T14:00:00Z',
      status: 'cancelled',
      status_display: 'Cancelled',
      total_price: 200,
      billing_type: 'daily',
      billing_type_display: 'Per day',
      duration_hours: 4,
      is_recurring: false,
      recurrence_rule: 'none',
      notes: '',
      created_at: '2026-02-01T00:00:00Z',
      updated_at: '2026-02-10T00:00:00Z'
    },
  ];

  enableMocks(): void {
    this.useMocks.set(true);
  }

  disableMocks(): void {
    this.useMocks.set(false);
  }

  toggleMocks(): void {
    this.useMocks.set(!this.useMocks());
  }

  getReservations(params?: ReservationListParams): Observable<Reservation[]> {
    return (this.useMocks()
      ? of(this.filterMockReservations(params))
      : this.get<PaginatedResponse<Reservation>>('/reservations/', this.buildParams(params)).pipe(
          map(response => response.results.map(reservation => this.normalizeReservation(reservation)))
        )).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getReservationsPage(params?: ReservationListParams): Observable<PaginatedResponse<Reservation>> {
    return (this.useMocks()
      ? of(this.paginateMockReservations(this.filterMockReservations(params)))
      : this.get<PaginatedResponse<Reservation>>('/reservations/', this.buildParams(params)).pipe(
          map(response => ({
            ...response,
            results: response.results.map(reservation => this.normalizeReservation(reservation))
          }))
        )).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  createReservation(data: CreateReservation): Observable<Reservation> {
    const source = this.useMocks()
      ? of(this.createMockReservation(data))
      : this.post<Reservation>('/reservations/create/', data).pipe(
          map(reservation => this.normalizeReservation(reservation))
        );

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getReservation(id: number): Observable<Reservation> {
    const source = this.useMocks()
      ? of(this.normalizeReservation(this.mockReservations.find(r => r.id === id) || ({} as Reservation)))
      : this.get<Reservation>(`/reservations/${id}/`).pipe(
          map(reservation => this.normalizeReservation(reservation))
        );

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  cancelReservation(id: number): Observable<any> {
    const source = this.useMocks()
      ? this.cancelMockReservation(id)
      : this.post(`/reservations/${id}/cancel/`, {});

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateReservation(id: number, payload: ReservationUpdatePayload): Observable<ReservationUpdatePayload> {
    const source = this.useMocks()
      ? of(this.updateMockReservation(id, payload))
      : this.put<ReservationUpdatePayload>(`/reservations/${id}/update/`, payload);

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  patchReservation(id: number, payload: ReservationUpdatePayload): Observable<ReservationUpdatePayload> {
    const source = this.useMocks()
      ? of(this.updateMockReservation(id, payload))
      : this.patch<ReservationUpdatePayload>(`/reservations/${id}/update/`, payload);

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  checkAvailability(spaceId: number, payload: ReservationAvailabilityPayload = {}): Observable<Record<string, unknown>> {
    const source = this.useMocks()
      ? of(this.checkMockAvailability(spaceId, payload))
      : this.post<Record<string, unknown>>(`/reservations/availability/${spaceId}/`, payload);

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  private buildParams(params?: object): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return httpParams.keys().length ? httpParams : undefined;
  }

  private normalizeReservation(reservation: Reservation): Reservation {
    return {
      ...reservation,
      total_price: Number(reservation.total_price)
    };
  }

  private filterMockReservations(params?: ReservationListParams): Reservation[] {
    return this.mockReservations.filter(reservation => {
      if (params?.billing_type && reservation.billing_type !== params.billing_type) {
        return false;
      }

      if (params?.is_recurring !== undefined && reservation.is_recurring !== params.is_recurring) {
        return false;
      }

      if (params?.status && reservation.status !== params.status) {
        return false;
      }

      return true;
    });
  }

  private paginateMockReservations(reservations: Reservation[]): PaginatedResponse<Reservation> {
    return {
      count: reservations.length,
      next: null,
      previous: null,
      results: reservations
    };
  }

  private createMockReservation(data: CreateReservation): Reservation {
    const newReservation: Reservation = {
      id: Date.now(),
      user_detail: { id: 1, email: 'user@example.com' },
      space_detail: { id: data.space_id, name: 'Mock Space' },
      start_datetime: data.start_datetime,
      end_datetime: data.end_datetime,
      status: 'pending',
      status_display: 'En attente',
      total_price: 100, // Mock calculation
      billing_type: data.billing_type,
      billing_type_display: data.billing_type === 'hourly' ? 'Par heure' : 'Par jour',
      duration_hours: 8,
      is_recurring: data.is_recurring || false,
      recurrence_rule: data.recurrence_rule || 'none',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.mockReservations.push(newReservation);
    return newReservation;
  }

  private cancelMockReservation(id: number): Observable<any> {
    const index = this.mockReservations.findIndex(r => r.id === id);
    if (index > -1) {
      this.mockReservations[index].status = 'cancelled';
      this.mockReservations[index].status_display = 'Annulée';
    }
    return of({ success: true });
  }

  private updateMockReservation(id: number, payload: ReservationUpdatePayload): ReservationUpdatePayload {
    const reservation = this.mockReservations.find(item => item.id === id);

    if (!reservation) {
      return payload;
    }

    Object.assign(reservation, payload, { updated_at: new Date().toISOString() });
    return payload;
  }

  private checkMockAvailability(spaceId: number, payload: ReservationAvailabilityPayload): Record<string, unknown> {
    return {
      available: !this.mockReservations.some(reservation =>
        reservation.space_detail?.id === spaceId &&
        reservation.status !== 'cancelled' &&
        payload.start_datetime &&
        payload.end_datetime &&
        payload.start_datetime < reservation.end_datetime &&
        payload.end_datetime > reservation.start_datetime
      ),
      space_id: spaceId
    };
  }
}
