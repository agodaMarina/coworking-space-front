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
