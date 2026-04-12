import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
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
  private readonly useMocks = signal(false); // Variable pour switcher entre mocks et API

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
      amenities: [
        { id: 4, name: 'Video Conference', icon: 'pi pi-video' },
        { id: 5, name: 'Projector', icon: 'pi pi-play' }
      ],
      created_at: '2024-01-01T00:00:00Z'
    }
  ];

  toggleMocks(): void {
    this.useMocks.set(!this.useMocks());
  }

  getSpaces(): Observable<Space[]> {
    if (this.useMocks()) {
      return of(this.mockSpaces);
    }
    return this.get<Space[]>('/spaces/');
  }

  getAvailableSpaces(): Observable<Space[]> {
    if (this.useMocks()) {
      return of(this.mockSpaces.filter(s => s.is_available));
    }
    return this.get<Space[]>('/spaces/available/');
  }

  getSpace(id: number): Observable<Space> {
    if (this.useMocks()) {
      const space = this.mockSpaces.find(s => s.id === id);
      return space ? of(space) : of({} as Space);
    }
    return this.get<Space>(`/spaces/${id}/`);
  }

  getAmenities(): Observable<Amenity[]> {
    if (this.useMocks()) {
      return of([
        { id: 1, name: 'Wi-Fi 5G', icon: 'pi pi-wifi' },
        { id: 2, name: 'Standing Desk', icon: 'pi pi-desktop' },
        { id: 3, name: 'Whiteboard', icon: 'pi pi-palette' },
        { id: 4, name: 'Video Conference', icon: 'pi pi-video' },
        { id: 5, name: 'Projector', icon: 'pi pi-play' }
      ]);
    }
    return this.get<Amenity[]>('/spaces/amenities/');
  }
}
