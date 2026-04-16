import { Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { ApiService } from '../api.service';

export interface Space {
  id: number;
  name: string;
  space_type: string;
  space_type_display: string;
  description: string;
  capacity: number;
  price_per_hour: number;
  price_per_day: number;
  address: string;
  is_available: boolean;
  photo?: string;
  photos: any[];
  amenities: Amenity[];
  created_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
}

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

  /** @deprecated use enableMocks() */
  toggleMocks(): void {
    this.useMocks.set(!this.useMocks());
  }

  getSpaces(): Observable<Space[]> {
    return (this.useMocks()
      ? of(this.mockSpaces)
      : this.get<Space[]>('/spaces/')).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getAvailableSpaces(): Observable<Space[]> {
    return (this.useMocks()
      ? of(this.mockSpaces.filter(s => s.is_available))
      : this.get<Space[]>('/spaces/available/')).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }

  getSpace(id: number): Observable<Space> {
    const source = this.useMocks()
      ? of(this.mockSpaces.find(s => s.id === id) || ({} as Space))
      : this.get<Space>(`/spaces/${id}/`);

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
      : this.get<Amenity[]>('/spaces/amenities/')).pipe(
      tap(() => this.isLoading.set(true)),
      finalize(() => this.isLoading.set(false))
    );
  }
}
