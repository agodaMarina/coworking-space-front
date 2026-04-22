import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../http/api.service';

export interface DashboardStats {
  total_reservations: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  total_revenue: number;
  occupancy_rate: number;
  today_reservations: number;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardService extends ApiService {

  getDashboard(dateFrom?: string, dateTo?: string): Observable<DashboardStats> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('date_from', dateFrom);
    if (dateTo)   params = params.set('date_to', dateTo);
    return this.get<DashboardStats>('/admin/dashboard/', params.keys().length ? params : undefined);
  }

  exportReservationsCsv(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/admin/export/reservations/`, { responseType: 'blob' });
  }
}
