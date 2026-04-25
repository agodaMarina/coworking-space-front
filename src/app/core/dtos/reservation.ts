export interface Reservation {
    id: number;
    user_detail: any;
    space_detail: any;
    start_datetime: string;
    end_datetime: string;
    status: 'pending' | 'confirmed' | 'rejected' | 'payment_pending' | 'paid' | 'cancelled' | 'completed';
    status_display: string;
    total_price: number;
    billing_type: string;
    billing_type_display: string;
    duration_hours: number;
    is_recurring: boolean;
    recurrence_rule: string;
    notes: string;
    can_pay: boolean;
    confirmed_at: string | null;
    confirmed_by: any | null;
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
    status?: 'pending' | 'confirmed' | 'rejected' | 'payment_pending' | 'paid' | 'cancelled' | 'completed';
}

export interface ReservationUpdatePayload {
    status?: 'pending' | 'confirmed' | 'rejected' | 'payment_pending' | 'paid' | 'cancelled' | 'completed';
    notes?: string;
}

export interface ReservationAvailabilityPayload {
    start_datetime?: string;
    end_datetime?: string;
    billing_type?: 'hourly' | 'daily';
}
