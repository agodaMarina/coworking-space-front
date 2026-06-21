import { HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, defer, finalize } from 'rxjs';
import { CursorPaginatedResponse } from '../dtos/pagination';
import { Room, RoomListParams, RoomWritePayload } from '../dtos/room';
import { ApiService } from '../http/api.service';

@Injectable({ providedIn: 'root' })
export class RoomsService extends ApiService {
  readonly isLoading = signal(false);

  // ── Lecture ─────────────────────────────────────────────────────────────────

  getRooms(params?: RoomListParams): Observable<CursorPaginatedResponse<Room>> {
    return this.withLoading(
      this.get<CursorPaginatedResponse<Room>>('/rooms', this.buildParams(params))
    );
  }

  getRoom(id: string): Observable<Room> {
    return this.withLoading(this.get<Room>(`/rooms/${id}`));
  }

  // ── Écriture (ADMIN / MANAGER) ───────────────────────────────────────────────

  createRoom(payload: RoomWritePayload): Observable<Room> {
    return this.withLoading(this.post<Room>('/rooms', payload));
  }

  updateRoom(id: string, payload: Partial<RoomWritePayload> & { version: number }): Observable<Room> {
    return this.withLoading(this.put<Room>(`/rooms/${id}`, payload));
  }

  deleteRoom(id: string): Observable<{ message: string }> {
    return this.withLoading(this.delete<{ message: string }>(`/rooms/${id}`));
  }

  // ── Gestion des équipements d'une salle (ADMIN / MANAGER) ──────────────────

  addEquipmentToRoom(roomId: string, equipmentId: string): Observable<Room> {
    return this.withLoading(
      this.post<Room>(`/rooms/${roomId}/equipments/${equipmentId}`, {})
    );
  }

  removeEquipmentFromRoom(roomId: string, equipmentId: string): Observable<Room> {
    return this.withLoading(
      this.delete<Room>(`/rooms/${roomId}/equipments/${equipmentId}`)
    );
  }

  // ── Utilitaires ─────────────────────────────────────────────────────────────

  private withLoading<T>(source: Observable<T>): Observable<T> {
    return defer(() => {
      this.isLoading.set(true);
      return source.pipe(finalize(() => this.isLoading.set(false)));
    });
  }

  private buildParams(params?: object): HttpParams | undefined {
    if (!params) return undefined;
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams.keys().length ? httpParams : undefined;
  }
}
