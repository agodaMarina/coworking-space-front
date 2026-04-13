import { Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { ApiService } from '../api.service';

export interface Reservation {
  id: number;
  user_detail: any;
  space_detail: any;
  start_datetime: string;
  end_datetime: string;
  status: string;
  status_display: string;
  total_price: number;
  billing_type: string;
  billing_type_display: string;
  duration_hours: number;
  is_recurring: boolean;
  recurrence_rule: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReservation {
  space_id: number;
  start_datetime: string;
  end_datetime: string;
  billing_type: 'hourly' | 'daily';
  is_recurring?: boolean;
  recurrence_rule?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationsService extends ApiService {
  private readonly useMocks = signal(false);
  readonly isLoading = signal(false);

  // Mock data
  private mockReservations: Reservation[] = [
    {
      id: 1,
      user_detail: { id: 1, email: 'user@example.com' },
      space_detail: { id: 1, name: 'Downtown Desk #1' },
      start_datetime: '2024-01-15T09:00:00Z',
      end_datetime: '2024-01-15T17:00:00Z',
      status: 'confirmed',
      status_display: 'Confirmée',
      total_price: 25,
      billing_type: 'daily',
      billing_type_display: 'Par jour',
      duration_hours: 8,
      is_recurring: false,
      recurrence_rule: 'none',
      notes: '',
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z'
    }
  ];

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
