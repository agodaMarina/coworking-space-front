import { HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { finalize, map, Observable, of, tap } from 'rxjs';
import { PaginatedResponse } from '../dtos/pagination';
import {
  Amenity,
  Space,
  SpaceAvailabilityParams,
  SpaceAvailabilityResponse,
  SpaceListParams,
  SpacePhoto,
  SpaceWritePayload
} from '../dtos/space';
import { ApiService } from '../http/api.service';

type SpaceLike = {
  id?: number;
  name?: string;
  space_type?: string;
  space_type_display?: string;
  description?: string;
  capacity?: number;
  price_per_hour?: number | string;
  price_per_day?: number | string;
  address?: string;
  is_available?: boolean;
  photo?: string;
  photos?: SpacePhoto[];
  amenities?: Amenity[] | number[];
  created_at?: string;
};

@Injectable({
  providedIn: 'root'
})
export class SpacesService extends ApiService {
  private readonly useMocks = signal(true);
  readonly isLoading = signal(false); // Loading state

  // Mock data
  private mockSpaces: Space[] = [
    {
      id: 1,
      name: 'Downtown Desk #1',
      space_type: 'desk',
      space_type_display: 'Bureau individuel',
      description: 'Modern dedicated desk with high-speed internet and natural light',
      capacity: 1,
      price_per_hour: 10,
      price_per_day: 25,
      address: 'Downtown, Lomé',
      is_available: true,
      photos: [],
      photo: 'https://picsum.photos/seed/space-1/800/600.jpg',
      amenities: [
        { id: 1, name: 'Wi-Fi 5G', icon: 'pi pi-wifi' },
        { id: 2, name: 'Standing Desk', icon: 'pi pi-desktop' }
      ],
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Collaborative Space',
      space_type: 'open_space',
      space_type_display: 'Espace ouvert',
      description: 'Open layout perfect for team collaboration and creative work',
      capacity: 10,
      price_per_hour: 50,
      price_per_day: 150,
      address: 'Business District, Lomé',
      is_available: true,
      photos: [],
      photo: 'https://picsum.photos/seed/space-2/800/600.jpg',
      amenities: [
        { id: 1, name: 'Wi-Fi 5G', icon: 'pi pi-wifi' },
        { id: 3, name: 'Whiteboard', icon: 'pi pi-palette' }
      ],
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: 'Executive Meeting Room',
      space_type: 'meeting_room',
      space_type_display: 'Salle de réunion',
      description: 'Premium room with video conferencing and professional setup',
      capacity: 8,
      price_per_hour: 30,
      price_per_day: 75,
      address: 'CBD, Lomé',
      is_available: true,
      photos: [],
      photo: 'https://picsum.photos/seed/space-3/800/600.jpg',
      amenities: [
        { id: 4, name: 'Video Conference', icon: 'pi pi-video' },
        { id: 5, name: 'Projector', icon: 'pi pi-play' }
      ],
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 4,
      name: 'The Skyline Suite',
      space_type: 'private',
      space_type_display: 'Bureau privé',
      description: 'A sleek private office with panoramic city views, perfect for focused deep work or confidential meetings.',
      capacity: 4,
      price_per_hour: 45,
      price_per_day: 120,
      address: 'Plateau, Lomé',
      is_available: true,
      photos: [],
      amenities: [
        { id: 1, name: 'Wi-Fi 5G', icon: 'pi pi-wifi' },
        { id: 6, name: 'Coffee Machine', icon: 'pi pi-inbox' },
        { id: 7, name: 'Private Locker', icon: 'pi pi-lock' }
      ],
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 5,
      name: 'The Boardroom',
      space_type: 'conference',
      space_type_display: 'Salle de conférence',
      description: 'A full-scale conference room built for presentations, workshops, and large team gatherings.',
      capacity: 30,
      price_per_hour: 80,
      price_per_day: 350,
      address: 'Business District, Lomé',
      is_available: true,
      photos: [],
      amenities: [
        { id: 4, name: 'Video Conference', icon: 'pi pi-video' },
        { id: 5, name: 'Projector', icon: 'pi pi-play' },
        { id: 8, name: 'Sound System', icon: 'pi pi-volume-up' },
        { id: 9, name: 'Catering Available', icon: 'pi pi-shopping-cart' }
      ],
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 6,
      name: 'Studio Loft',
      space_type: 'open_space',
      space_type_display: 'Espace ouvert',
      description: 'An industrial-style open loft with high ceilings and natural light — ideal for creative teams and agencies.',
      capacity: 20,
      price_per_hour: 60,
      price_per_day: 200,
      address: 'Arts Quarter, Lomé',
      is_available: false,
      photos: [],
      amenities: [
        { id: 1, name: 'Wi-Fi 5G', icon: 'pi pi-wifi' },
        { id: 3, name: 'Whiteboard', icon: 'pi pi-palette' },
        { id: 10, name: 'Natural Light', icon: 'pi pi-sun' }
      ],
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 7,
      name: 'Focus Pod Alpha',
      space_type: 'desk',
      space_type_display: 'Bureau individuel',
      description: 'A quiet, enclosed desk pod with soundproofing panels — the ultimate setup for distraction-free work.',
      capacity: 1,
      price_per_hour: 12,
      price_per_day: 30,
      address: 'Tokoin, Lomé',
      is_available: true,
      photos: [],
      amenities: [
        { id: 1, name: 'Wi-Fi 5G', icon: 'pi pi-wifi' },
        { id: 11, name: 'Soundproofing', icon: 'pi pi-headphones' },
        { id: 2, name: 'Standing Desk', icon: 'pi pi-desktop' }
      ],
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 8,
      name: 'Innovation Hub',
      space_type: 'meeting_room',
      space_type_display: 'Salle de réunion',
      description: 'A creative meeting room fitted with digital whiteboards and modular furniture for agile sessions.',
      capacity: 12,
      price_per_hour: 40,
      price_per_day: 95,
      address: 'Agbalépédogan, Lomé',
      is_available: true,
      photos: [],
      amenities: [
        { id: 3, name: 'Whiteboard', icon: 'pi pi-palette' },
        { id: 4, name: 'Video Conference', icon: 'pi pi-video' },
        { id: 12, name: 'Modular Furniture', icon: 'pi pi-table' }
      ],
      created_at: '2024-01-01T00:00:00Z'
    }
  ];

  enableMocks(): void {
    this.useMocks.set(true);
  }

  disableMocks(): void {
    this.useMocks.set(false);
  }

  /** @deprecated use enableMocks() */
  toggleMocks(): void {
    this.useMocks.set(!this.useMocks());
  }

  getSpaces(params?: SpaceListParams): Observable<Space[]> {
    return (this.useMocks()
      ? of(this.filterMockSpaces(params))
      : this.get<PaginatedResponse<Space>>('/spaces/', this.buildParams(params)).pipe(
          map(response => response.results.map(space => this.normalizeSpace(space)))
        )).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getSpacesPage(params?: SpaceListParams): Observable<PaginatedResponse<Space>> {
    return (this.useMocks()
      ? of(this.paginateMockSpaces(this.filterMockSpaces(params)))
      : this.get<PaginatedResponse<Space>>('/spaces/', this.buildParams(params)).pipe(
          map(response => ({
            ...response,
            results: response.results.map(space => this.normalizeSpace(space))
          }))
        )).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getAvailableSpaces(params?: Omit<SpaceListParams, 'is_available'>): Observable<Space[]> {
    const filters = { ...params, is_available: true };

    return (this.useMocks()
      ? of(this.filterMockSpaces(filters))
      : this.get<PaginatedResponse<Space>>('/spaces/available/', this.buildParams(params)).pipe(
          map(response => response.results.map(space => this.normalizeSpace(space)))
        )).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getAvailableSpacesPage(params?: Omit<SpaceListParams, 'is_available'>): Observable<PaginatedResponse<Space>> {
    return (this.useMocks()
      ? of(this.paginateMockSpaces(this.filterMockSpaces({ ...params, is_available: true })))
      : this.get<PaginatedResponse<Space>>('/spaces/available/', this.buildParams(params)).pipe(
          map(response => ({
            ...response,
            results: response.results.map(space => this.normalizeSpace(space))
          }))
        )).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getSpace(id: number): Observable<Space> {
    const source = this.useMocks()
      ? of(this.normalizeSpace(this.mockSpaces.find(s => s.id === id) || ({} as Space)))
      : this.get<Space>(`/spaces/${id}/`).pipe(
          map(space => this.normalizeSpace(space))
        );

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getAmenities(): Observable<Amenity[]> {
    return (this.useMocks()
      ? of([
          { id: 1, name: 'Wi-Fi 5G', icon: 'pi pi-wifi' },
          { id: 2, name: 'Standing Desk', icon: 'pi pi-desktop' },
          { id: 3, name: 'Whiteboard', icon: 'pi pi-palette' },
          { id: 4, name: 'Video Conference', icon: 'pi pi-video' },
          { id: 5, name: 'Projector', icon: 'pi pi-play' }
        ])
      : this.get<PaginatedResponse<Amenity>>('/spaces/amenities/').pipe(
          map(response => response.results)
        )).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getSpaceAvailability(id: number, params?: SpaceAvailabilityParams): Observable<SpaceAvailabilityResponse> {
    const source = this.useMocks()
      ? of(this.getMockAvailability(id, params))
      : this.get<SpaceAvailabilityResponse>(`/spaces/${id}/availability/`, this.buildParams(params));

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  createSpace(payload: SpaceWritePayload): Observable<Space> {
    const source = this.useMocks()
      ? of(this.createMockSpace(payload))
      : this.post<Partial<Space>>('/spaces/create/', this.toSpaceFormData(payload)).pipe(
          map(space => this.normalizeSpace(space, payload))
        );

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateSpace(id: number, payload: SpaceWritePayload): Observable<Space> {
    const source = this.useMocks()
      ? of(this.updateMockSpace(id, payload))
      : this.put<Partial<Space>>(`/spaces/${id}/update/`, this.toSpaceFormData(payload)).pipe(
          map(space => this.normalizeSpace(space, payload))
        );

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  patchSpace(id: number, payload: Partial<SpaceWritePayload>): Observable<Space> {
    const source = this.useMocks()
      ? of(this.updateMockSpace(id, payload))
      : this.patch<Partial<Space>>(`/spaces/${id}/update/`, this.toSpaceFormData(payload)).pipe(
          map(space => this.normalizeSpace(space, payload))
        );

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  deleteSpace(id: number): Observable<void> {
    const source = this.useMocks()
      ? of(this.deleteMockSpace(id))
      : this.delete<void>(`/spaces/${id}/delete/`);

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  uploadSpacePhoto(id: number, file: File, isPrimary = false): Observable<Partial<Space>> {
    const source = this.useMocks()
      ? of(this.uploadMockSpacePhoto(id, file, isPrimary))
      : this.post<Partial<Space>>(`/spaces/${id}/photos/`, this.toPhotoFormData(file, isPrimary));

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  deleteSpacePhoto(spaceId: number, photoId: number): Observable<void> {
    const source = this.useMocks()
      ? of(this.deleteMockSpacePhoto(spaceId, photoId))
      : this.delete<void>(`/spaces/${spaceId}/photos/${photoId}/delete/`);

    return source.pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  createAmenity(payload: Pick<Amenity, 'name' | 'icon'>): Observable<Amenity> {
    const source = this.useMocks()
      ? of(this.createMockAmenity(payload))
      : this.post<Amenity>('/spaces/amenities/create/', payload);

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

  private toSpaceFormData(payload: Partial<SpaceWritePayload>): FormData {
    const formData = new FormData();

    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (key === 'amenities' && Array.isArray(value)) {
        value.forEach(amenityId => formData.append('amenities', String(amenityId)));
        continue;
      }

      formData.append(key, String(value));
    }

    return formData;
  }

  private toPhotoFormData(file: File, isPrimary: boolean): FormData {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_primary', String(isPrimary));
    return formData;
  }

  private normalizeSpace(space: SpaceLike, fallback?: Partial<SpaceWritePayload>): Space {
    const amenities = Array.isArray(space.amenities)
      ? (typeof space.amenities[0] === 'number'
          ? this.mapAmenityIds(space.amenities as unknown as number[])
          : (space.amenities as Amenity[]))
      : this.mapAmenityIds(fallback?.amenities);

    return {
      id: space.id ?? 0,
      name: space.name ?? fallback?.name ?? '',
      space_type: space.space_type ?? fallback?.space_type ?? 'desk',
      space_type_display: space.space_type_display ?? this.getSpaceTypeDisplay(space.space_type ?? fallback?.space_type),
      description: space.description ?? fallback?.description ?? '',
      capacity: Number(space.capacity ?? fallback?.capacity ?? 0),
      price_per_hour: Number(space.price_per_hour ?? fallback?.price_per_hour ?? 0),
      price_per_day: Number(space.price_per_day ?? fallback?.price_per_day ?? 0),
      address: space.address ?? fallback?.address ?? '',
      is_available: space.is_available ?? fallback?.is_available ?? false,
      photo: space.photo,
      photos: Array.isArray(space.photos) ? space.photos : [],
      amenities,
      created_at: space.created_at ?? new Date().toISOString()
    };
  }

  private getSpaceTypeDisplay(type?: string): string {
    const labels: Record<string, string> = {
      desk: 'Bureau individuel',
      open_space: 'Espace ouvert',
      meeting_room: 'Salle de réunion',
      private: 'Bureau privé',
      conference: 'Salle de conférence'
    };

    return type ? (labels[type] ?? type) : '';
  }

  private getMockAmenities(): Amenity[] {
    return [
      { id: 1, name: 'Wi-Fi 5G', icon: 'pi pi-wifi' },
      { id: 2, name: 'Standing Desk', icon: 'pi pi-desktop' },
      { id: 3, name: 'Whiteboard', icon: 'pi pi-palette' },
      { id: 4, name: 'Video Conference', icon: 'pi pi-video' },
      { id: 5, name: 'Projector', icon: 'pi pi-play' }
    ];
  }

  private mapAmenityIds(amenityIds?: number[]): Amenity[] {
    if (!amenityIds?.length) {
      return [];
    }

    return this.getMockAmenities().filter(amenity => amenityIds.includes(amenity.id));
  }

  private filterMockSpaces(params?: SpaceListParams): Space[] {
    return this.mockSpaces.filter(space => {
      if (params?.capacity !== undefined && space.capacity < params.capacity) {
        return false;
      }

      if (params?.is_available !== undefined && space.is_available !== params.is_available) {
        return false;
      }

      if (params?.space_type && space.space_type !== params.space_type) {
        return false;
      }

      if (params?.search) {
        const query = params.search.toLowerCase();
        const haystack = `${space.name} ${space.address} ${space.description}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  private paginateMockSpaces(spaces: Space[]): PaginatedResponse<Space> {
    return {
      count: spaces.length,
      next: null,
      previous: null,
      results: spaces
    };
  }

  private getMockAvailability(id: number, params?: SpaceAvailabilityParams): SpaceAvailabilityResponse {
    const space = this.mockSpaces.find(item => item.id === id);

    return {
      available: !!space?.is_available,
      space_id: id,
      start_datetime: params?.start_datetime ?? null,
      end_datetime: params?.end_datetime ?? null,
      billing_type: params?.billing_type ?? null
    };
  }

  private createMockSpace(payload: SpaceWritePayload): Space {
    const newSpace: Space = {
      ...this.normalizeSpace({}, payload),
      id: Math.max(0, ...this.mockSpaces.map(space => space.id)) + 1,
      created_at: new Date().toISOString()
    };

    this.mockSpaces = [...this.mockSpaces, newSpace];

    return newSpace;
  }

  private updateMockSpace(id: number, payload: Partial<SpaceWritePayload>): Space {
    const existingSpace = this.mockSpaces.find(space => space.id === id);

    if (!existingSpace) {
      return {} as Space;
    }

    const updatedSpace: Space = this.normalizeSpace({ ...existingSpace, ...payload, id });

    this.mockSpaces = this.mockSpaces.map(space =>
      space.id === id ? updatedSpace : space
    );

    return updatedSpace;
  }

  private deleteMockSpace(id: number): void {
    this.mockSpaces = this.mockSpaces.filter(space => space.id !== id);
  }

  private uploadMockSpacePhoto(id: number, file: File, isPrimary: boolean): Partial<Space> {
    const target = this.mockSpaces.find(space => space.id === id);

    if (!target) {
      return {};
    }

    const photo: SpacePhoto = {
      id: Math.max(0, ...target.photos.map((item: SpacePhoto) => item.id ?? 0)) + 1,
      url: URL.createObjectURL(file),
      is_primary: isPrimary,
      uploaded_at: new Date().toISOString()
    };

    const photos = isPrimary
      ? target.photos.map((item: SpacePhoto) => ({ ...item, is_primary: false }))
      : target.photos;

    target.photos = [...photos, photo];
    if (isPrimary || !target.photo) {
      target.photo = photo.url;
    }

    return { id: target.id, name: target.name, photo: target.photo, photos: target.photos };
  }

  private deleteMockSpacePhoto(spaceId: number, photoId: number): void {
    const target = this.mockSpaces.find(space => space.id === spaceId);

    if (!target) {
      return;
    }

    target.photos = target.photos.filter((photo: SpacePhoto) => photo.id !== photoId);
    const primary = target.photos.find((photo: SpacePhoto) => photo.is_primary);
    target.photo = primary?.url ?? target.photos[0]?.url;
  }

  private createMockAmenity(payload: Pick<Amenity, 'name' | 'icon'>): Amenity {
    return {
      id: Math.max(0, ...this.getMockAmenities().map(amenity => amenity.id)) + 1,
      ...payload
    };
  }

}
