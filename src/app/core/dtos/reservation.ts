// DTOs pour les Réservations — Flask ShareRoom API
// Les réservations sont imbriquées sous /api/rooms/:room_id/reservations

export interface Reservation {
  id: string;
  start_time: string;  // ISO 8601 UTC
  end_time: string;    // ISO 8601 UTC
}

export interface CreateReservationPayload {
  start_time: string;  // ISO 8601 UTC ex: "2026-06-20T09:00:00Z"
  end_time: string;    // ISO 8601 UTC ex: "2026-06-20T10:00:00Z"
}

export interface CancelReservationResponse {
  message: string;
}

// ── Types Django conservés pour compatibilité (à migrer lors de l'intégration paiement) ──

/** @deprecated Utiliser Reservation (Flask). Conservé pour la migration paiement future. */
export interface LegacyReservation {
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

/** @deprecated Conservé pour la migration paiement future. */
export interface LegacyCreateReservation {
  space_id: number;
  start_datetime: string;
  end_datetime: string;
  billing_type: 'hourly' | 'daily';
  is_recurring?: boolean;
  recurrence_rule?: string;
  notes?: string;
}
