import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

export abstract class ApiService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = '/api';

  protected request<T>(path: string, options: { body?: unknown; params?: HttpParams } = {}): Observable<T> {
    return this.http.request<T>('GET', `${this.baseUrl}${path}`, {
      body: options.body,
      params: options.params,
    });
  }

  protected get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { params });
  }

  protected post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }
}
