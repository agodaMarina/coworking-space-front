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

export interface ReservationListParams {
    billing_type?: 'hourly' | 'daily';
    is_recurring?: boolean;
    ordering?: string;
    page?: number;
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
}

export interface ReservationUpdatePayload {
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
    notes?: string;
}

export interface ReservationAvailabilityPayload {
    start_datetime?: string;
    end_datetime?: string;
    billing_type?: 'hourly' | 'daily';
}
