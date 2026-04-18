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

export interface SpacePhoto {
    id: number;
    url: string;
    is_primary: boolean;
    uploaded_at: string;
}

export interface Amenity {
    id: number;
    name: string;
    icon: string;
}

export interface SpaceListParams {
    capacity?: number;
    is_available?: boolean;
    ordering?: string;
    page?: number;
    search?: string;
    space_type?: 'desk' | 'open_space' | 'meeting_room' | 'private' | 'conference';
}

export interface SpaceAvailabilityParams {
    billing_type?: 'hourly' | 'daily';
    end_datetime?: string;
    start_datetime?: string;
}

export type SpaceAvailabilityResponse = Record<string, unknown>;

export interface SpaceWritePayload {
    name: string;
    space_type: 'desk' | 'open_space' | 'meeting_room' | 'private' | 'conference';
    description?: string;
    capacity?: number;
    price_per_hour: number | string;
    price_per_day: number | string;
    address?: string;
    is_available?: boolean;
    amenities?: number[];
}
