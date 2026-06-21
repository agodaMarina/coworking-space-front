import { HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, defer, finalize } from 'rxjs';
import { Equipment, EquipmentListParams, EquipmentWritePayload } from '../dtos/equipment';
import { CursorPaginatedResponse } from '../dtos/pagination';
import { ApiService } from '../http/api.service';

@Injectable({ providedIn: 'root' })
export class EquipmentsService extends ApiService {
  readonly isLoading = signal(false);

  // ── Lecture ─────────────────────────────────────────────────────────────────

  getEquipments(params?: EquipmentListParams): Observable<CursorPaginatedResponse<Equipment>> {
    return this.withLoading(
      this.get<CursorPaginatedResponse<Equipment>>('/equipments', this.buildParams(params))
    );
  }

  // ── CRUD (ADMIN uniquement) ─────────────────────────────────────────────────

  createEquipment(payload: EquipmentWritePayload): Observable<Equipment> {
    return this.withLoading(this.post<Equipment>('/equipments', payload));
  }

  updateEquipment(id: string, payload: EquipmentWritePayload): Observable<Equipment> {
    return this.withLoading(this.put<Equipment>(`/equipments/${id}`, payload));
  }

  deleteEquipment(id: string): Observable<{ message: string }> {
    return this.withLoading(this.delete<{ message: string }>(`/equipments/${id}`));
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
