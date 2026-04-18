import { Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { CreateReservation, Reservation } from '../dtos/reservation';
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

  toggleMocks(): void {
    this.useMocks.set(!this.useMocks());
  }

  getReservations(): Observable<Reservation[]> {
    return (this.useMocks()
      ? of(this.mockReservations)
      : this.get<Reservation[]>('/reservations/')).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  createReservation(data: CreateReservation): Observable<Reservation> {
    const source = this.useMocks()
      ? of(this.createMockReservation(data))
      : this.post<Reservation>('/reservations/create/', data);

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getReservation(id: number): Observable<Reservation> {
    const source = this.useMocks()
      ? of(this.mockReservations.find(r => r.id === id) || ({} as Reservation))
      : this.get<Reservation>(`/reservations/${id}/`);

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
}
